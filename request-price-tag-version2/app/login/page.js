"use client";

import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useLogin } from "@/hook/use-login";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const { loading, error, login, clearError } = useLogin();

  function clearForm() {
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setMessage("");
    clearError();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const authenticatedUser = await login(username, password);
    if (authenticatedUser) {
      router.push("/home");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      {/* Background Shapes */}
      <div className="absolute -right-0 top-0 z-0 h-[358px] w-[56%] rounded-bl-[520px] rounded-br-[205px] bg-ball-gradient shadow-md max-md:h-[220px] max-md:w-[75%]" />

      <div className="absolute bottom-0 left-0 z-0 h-[334px] w-[52%] rounded-tl-[205px] rounded-tr-[520px] bg-ball-gradient shadow-md max-md:h-[180px] max-md:w-[85%]" />

      {/* Decorative Circles */}
      <div className="absolute left-[5%] top-[5%] z-0 h-[270px] w-[270px] rounded-full bg-ball-gradient max-md:h-[75px] max-md:w-[75px]" />

      <div className="absolute left-[30%] top-[20%] z-0 h-[107px] w-[107px] rounded-full bg-ball-gradient max-md:hidden" />

      <div className="absolute left-[44%] top-[40%] z-0 h-[107px] w-[107px] rounded-full bg-ball-gradient max-md:hidden" />

      <div className="absolute right-[1.3%] top-[66.5%] z-0 h-[107px] w-[107px] rounded-full bg-ball-gradient max-md:hidden" />
      {/* Main Container */}
      <div className="relative z-10 grid min-h-screen w-full grid-cols-2 items-center pr-[9%] pl-[5%] max-md:grid-cols-1 max-md:gap-9 max-md:px-5 max-md:py-12">
        {/* Logo Section */}
        <section className="flex items-center justify-start max-md:justify-center">
          <div className="flex items-center gap-10">
            <div className="image-logo">
              <Image
                src="/images/logo-new.png"
                alt="Lawson Station Logo"
                width={100}
                height={100}
                priority
              />
            </div>
            <div className="text-logo text-primary text-heading font-semibold">
              Request Price Tag
            </div>
          </div>
        </section>

        {/* Login Card */}
        <section className="flex items-center">
          <form
            onSubmit={handleSubmit}
            className="relative card-default min-h-[750px] w-full max-w-[500px] px-[54px] py-9 max-md:min-h-[400px] max-md:max-w-[380px] max-md:px-[30px]"
          >
            {/* Title */}
            <h1 className="mb-[26px] text-center text-heading font-semibold text-black">
              Login
            </h1>

            {/* Username */}
            <div className="mb-[17px] flex flex-col gap-2">
              <label
                htmlFor="username"
                className="text-label font-medium text-gray"
              >
                ชื่อผู้ใช้ <span className="text-danger">*</span>
              </label>

              <input
                id="username"
                name="username"
                type="text"
                placeholder="กรุณากรอกชื่อผู้ใช้"
                autoComplete="username"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setMessage("");
                  clearError();
                }}
                required
                className="input-default"
              />
            </div>

            {/* Password */}
            <div className="mb-1 flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-label font-medium text-gray"
              >
                รหัสผ่าน <span className="text-danger">*</span>
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="กรุณากรอกรหัสผ่าน"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setMessage("");
                    clearError();
                  }}
                  required
                  className="input-default pr-10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Clear Form */}
            <div className="mb-[27px] flex justify-end">
              <button
                type="button"
                onClick={clearForm}
                className="text-body text-secondary underline"
              >
                เคลียร์ข้อมูลฟอร์ม
              </button>
            </div>

            {error && (
              <p role="alert" className="mb-4 text-sm text-danger">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="mb-4 text-sm text-secondary">
                {message}
              </p>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              className="text-heading font-medium active:scale-[0.98] text-white"
            >
              {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
            </Button>

            <div className="absolute bottom-[0] right-[0] z-0 h-[85px] w-[85px] rounded-[50%_50%_15%_50%] bg-ball-gradient from-secondary to-primary max-md:h-[45px] max-md:w-[45px]" />

            <div className="absolute left-[0%] top-[0] z-0 h-[85px] w-[85px] rounded-[15%_50%_50%_50%] bg-ball-gradient from-secondary to-primary max-md:h-[45px] max-md:w-[45px]" />
          </form>
        </section>
      </div>
    </main>
  );
}
