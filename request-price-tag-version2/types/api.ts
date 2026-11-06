export type ApiSuccessResponse<T> = {
  success: true;
  code: number;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  code: number;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
