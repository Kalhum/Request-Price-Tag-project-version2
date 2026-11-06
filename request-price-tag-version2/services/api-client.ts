import type { ApiResponse } from "@/types/api";
import { cacheGet, cacheSet } from "@/libs/client-cache";

/**
 * Error มาตรฐานจากฝั่ง API Client
 * เก็บทั้ง HTTP status, รหัส error code และรายละเอียดเพิ่มเติมจากฝั่ง Server
 */
export class ApiClientError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export type QueryParamValue = string | number | boolean | undefined | null;
export type QueryParams = Record<string, QueryParamValue>;

export type ApiClientRequestInit = RequestInit & {
  /** อายุแคชฝั่ง client (มิลลิวินาที) ใช้เฉพาะคำขอแบบ GET */
  cacheTtl?: number;
  /** Query parameters ที่จะต่อท้าย URL อัตโนมัติ (ข้ามค่าที่เป็น undefined/null/"") */
  params?: QueryParams;
  /** ข้ามการแนบ x-api-key header */
  skipApiKey?: boolean;
};

export type ApiClientOptions = {
  basePath?: string;
  siteUrl?: string;
  apiKey?: string;
  includeServerCookies?: boolean;
  defaultHeaders?: HeadersInit;
};

/**
 * แปลง Path สัมพัทธ์ให้เป็น URL ที่สมบูรณ์
 * - ฝั่ง Browser: เติม `NEXT_PUBLIC_BASE_PATH` (ถ้ามี)
 * - ฝั่ง Server (SSR / Server Component): เติม `SITE_URL` หรือ `http://localhost:PORT` ให้ครบเพื่อใช้กับ Node `fetch`
 */
export const getFullPath = (
  path: string,
  options?: { basePath?: string; siteUrl?: string },
): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = options?.basePath ?? process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const relativePath = `/${path.replace(/^\//, "")}`;
  const normalizedBase = base.replace(/\/$/, "");

  // หากรันบน Server ต้องใช้ Absolute URL เสมอ
  if (typeof window === "undefined") {
    const siteUrlRaw =
      options?.siteUrl ||
      process.env.SITE_URL ||
      process.env.NEXTAUTH_URL ||
      `http://localhost:${process.env.PORT || "4007"}`;

    const siteUrl = siteUrlRaw.replace(/\/$/, "");
    const siteUrlWithBase =
      normalizedBase && siteUrl.endsWith(normalizedBase)
        ? siteUrl
        : `${siteUrl}${normalizedBase}`;

    return `${siteUrlWithBase}${relativePath}`;
  }

  return `${normalizedBase}${relativePath}`;
};

/**
 * ต่อ Query Parameters เข้ากับ URL อย่างปลอดภัย (ข้ามค่าที่เป็น undefined, null หรือ "")
 *
 * @example
 * buildUrlWithParams("/api/example", { search: "hello", status: undefined })
 * // => "/api/example?search=hello"
 */
export function buildUrlWithParams(url: string, params?: QueryParams): string {
  if (!params) return url;

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  if (!queryString) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${queryString}`;
}

/**
 * ฟังก์ชันหลักสำหรับเรียก API ของโปรเจกต์
 *
 * ความสามารถหลัก:
 * - แปลง URL อัตโนมัติทั้งฝั่ง Client และ Server (ผ่าน `getFullPath`)
 * - รองรับ `params` สำหรับสร้าง Query String โดยไม่ต้องต่อ string เอง
 * - รองรับ In-memory Cache ผ่าน `cacheTtl` (สำหรับ GET)
 * - แกะข้อมูลจาก `{ success: true, data: T }` ออกเป็น `T` ให้ทันที
 * - โยน `ApiClientError` เมื่อ HTTP status ไม่ใช่ 2xx หรือ `success === false`
 */
export async function apiFetch<T>(
  input: string,
  init: ApiClientRequestInit = {},
  clientOptions?: ApiClientOptions,
): Promise<T> {
  const { cacheTtl, params, skipApiKey = false, ...fetchInit } = init;
  const method = (fetchInit.method ?? "GET").toUpperCase();
  const isGet = method === "GET";

  const resolvedUrl = buildUrlWithParams(
    getFullPath(input, clientOptions),
    params,
  );

  if (cacheTtl && isGet) {
    const cached = cacheGet<T>(resolvedUrl);
    if (cached !== null) {
      return cached;
    }
  }

  const headers = new Headers(clientOptions?.defaultHeaders);

  if (fetchInit.headers) {
    new Headers(fetchInit.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  if (fetchInit.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const apiKey = clientOptions?.apiKey ?? process.env.API_KEY;
  if (!skipApiKey && apiKey && !headers.has("x-api-key")) {
    headers.set("x-api-key", apiKey);
  }

  const includeServerCookies = clientOptions?.includeServerCookies ?? true;
  if (
    includeServerCookies &&
    typeof window === "undefined" &&
    !headers.has("cookie")
  ) {
    try {
      const { cookies } = await import("next/headers");
      const cookieHeader = (await cookies()).toString();
      if (cookieHeader) {
        headers.set("cookie", cookieHeader);
      }
    } catch {
      // ข้ามกรณีไม่ได้รันอยู่ใน Next.js request scope
    }
  }

  let response: Response;

  try {
    response = await fetch(resolvedUrl, {
      cache: "no-store",
      ...fetchInit,
      headers,
    });
  } catch (error) {
    throw new ApiClientError(
      "Network request failed",
      0,
      "NETWORK_ERROR",
      error,
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch (error) {
    throw new ApiClientError(
      "Invalid server response",
      response.status,
      "INVALID_RESPONSE",
      error,
    );
  }

  if (!response.ok || !payload.success) {
    const errorPayload = payload.success
      ? { message: "Request failed", code: undefined, details: undefined }
      : payload.error;

    throw new ApiClientError(
      errorPayload.message,
      response.status,
      errorPayload.code,
      errorPayload.details,
    );
  }

  if (cacheTtl && isGet) {
    cacheSet(resolvedUrl, payload.data, cacheTtl);
  }

  return payload.data;
}

/**
 * คลาส `ApiClient` สำหรับเรียกใช้งานแบบระบุ HTTP Method ชัดเจน (`get`, `post`, `put`, `patch`, `delete`)
 *
 * @example
 * const items = await apiClient.get<ExampleItem[]>("/api/example", { params: { status: "active" } });
 * const created = await apiClient.post<ExampleItem>("/api/example", { title: "New Item" });
 */
export class ApiClient {
  private readonly options: ApiClientOptions;

  constructor(options: ApiClientOptions = {}) {
    this.options = options;
  }

  request<T>(input: string, init: ApiClientRequestInit = {}): Promise<T> {
    return apiFetch<T>(input, init, this.options);
  }

  get<T>(input: string, init: Omit<ApiClientRequestInit, "method"> = {}) {
    return this.request<T>(input, { ...init, method: "GET" });
  }

  post<T>(
    input: string,
    body?: unknown,
    init: Omit<ApiClientRequestInit, "method" | "body"> = {},
  ) {
    return this.request<T>(input, {
      ...init,
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  put<T>(
    input: string,
    body?: unknown,
    init: Omit<ApiClientRequestInit, "method" | "body"> = {},
  ) {
    return this.request<T>(input, {
      ...init,
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  patch<T>(
    input: string,
    body?: unknown,
    init: Omit<ApiClientRequestInit, "method" | "body"> = {},
  ) {
    return this.request<T>(input, {
      ...init,
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  delete<T>(input: string, init: Omit<ApiClientRequestInit, "method"> = {}) {
    return this.request<T>(input, { ...init, method: "DELETE" });
  }
}

/**
 * Instance มาตรฐานของ API Client สำหรับใช้ใน `services/*.service.ts`
 */
export const apiClient = new ApiClient();

/**
 * ดึงข้อความ Error ที่อ่านเข้าใจง่ายสำหรับนำไปแสดงบน UI / Toast
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
