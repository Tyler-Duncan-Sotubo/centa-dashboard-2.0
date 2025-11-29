"use client";

import AuthFooter from "@/components/navigation/AuthFooter";
import LoginForm from "./auth/login/page";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen justify-between pt-20 bg-white bg-[url('https://res.cloudinary.com/dw1ltt9iz/image/upload/v1760182057/sass-landing-bg_uavwxb.png')] bg-cover">
      {/* Centered Content */}
      <div className="p-10 sm:max-w-[36%] w-[95%] 2xl:max-w-[30%] mt-1 mx-auto border rounded-lg bg-monzo-textPrimary my-20 sm:my-0">
        <LoginForm />
      </div>
      <AuthFooter />
    </div>
  );
}
