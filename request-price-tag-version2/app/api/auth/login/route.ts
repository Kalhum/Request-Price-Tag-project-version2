import { apiError, apiSuccess, handleApiError, parseJsonBody } from "@/libs/api-response";
import { requireString } from "@/libs/input-validator";
import { validateUser } from "@/repo/auth.repo";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const username = requireString(body.username, "username", {
      maxLength: 50,
    });
    const password = requireString(body.password, "password", {
      maxLength: 200,
    });
    const user = await validateUser(username, password);
    if (!user) {
      return apiError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", 401, "INVALID_CREDENTIALS");
    }
    return apiSuccess({
      id: user.id,
      username: user.username,
      name: user.name,
      userGroup: user.user_group,
    });
  } catch (error) {
    return handleApiError(error, "Unable to authenticate user", "LOGIN_FAILED");
  }
}
