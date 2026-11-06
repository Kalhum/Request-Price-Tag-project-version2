"use client";

import Image from "next/image";

export default function LoginPage() {
  //function clearForm
  function clearForm() {
    const form = document.querySelector("form");
    form.reset();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      {/* Background Shapes */}
      <div className="absolute -right-0 top-0 z-0 h-[358px] w-[56%] rounded-bl-[520px] rounded-br-[205px] bg-ball-gradient  shadow-md max-md:h-[220px] max-md:w-[75%]" />

      <div className="absolute bottom-0 left-0 z-0 h-[334px] w-[52%] rounded-tl-[205px] rounded-tr-[520px] bg-ball-gradient  shadow-md max-md:h-[180px] max-md:w-[85%]" />

      {/* Decorative Circles */}
      <div className="absolute left-[5%] top-[5%] z-0 h-[270px] w-[270px] rounded-full bg-ball-gradient max-md:h-[75px] max-md:w-[75px]" />


      <div className="absolute left-[30%] top-[20%] z-0 h-[107px] w-[107px] rounded-full bg-ball-gradient  max-md:hidden" />

      <div className="absolute left-[44%] top-[40%] z-0 h-[107px] w-[107px] rounded-full bg-ball-gradient  max-md:hidden" />

      <div className="absolute right-[1.3%] top-[66.5%] z-0 h-[107px] w-[107px] rounded-full bg-ball-gradient max-md:hidden" />
      {/* Main Container */}
      <div className="relative z-10 pr-[9%] pl-[5%] grid min-h-screen w-full grid-cols-2 items-center max-md:grid-cols-1 max-md:gap-9 max-md:px-5 max-md:py-12">
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
        <section className="flex items-center justify-end">
          <form className=" relative card-default min-h-[750px] w-full max-w-[500px] px-[54px] py-9 max-md:min-h-[400px] max-md:max-w-[380px] max-md:px-[30px]">
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

              <input
                id="password"
                name="password"
                type="password"
                placeholder="กรุณากรอกรหัสผ่าน"
                autoComplete="current-password"
                required
                className="input-default"
              />
            </div>

            {/* Forgot Password */}
            <div className="mb-[27px] flex justify-end">
              <button
                onClick={clearForm}
                className="text-body text-secondary underline "
              >
                เคลียร์ข้อมูลฟอร์ม
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn-primary w-full  text-heading font-medium active:scale-[0.98]"
            >
              เข้าสู่ระบบ
            </button>

            <div className="absolute bottom-[0] right-[0] z-0 h-[85px] w-[85px] rounded-[50%_50%_15%_50%] bg-ball-gradient from-secondary to-primary max-md:h-[45px] max-md:w-[45px]" />

            <div className="absolute top-[0] left-[0%] z-0 h-[85px] w-[85px] rounded-[15%_50%_50%_50%] bg-ball-gradient from-secondary to-primary max-md:h-[45px] max-md:w-[45px]" />
          </form>
        </section>
      </div>
    </main>
  );
}
