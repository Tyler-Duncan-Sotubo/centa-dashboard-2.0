"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { isAxiosError } from "@/lib/axios";
import { getErrorMessage } from "@/utils/getErrorMessage";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import DividerWithText from "@/components/ui/DividerWithText";
import ApplicationLogo from "@/components/ui/applicationLogo";

export default function TwoFAPage() {
  const axiosInstance = useAxiosAuth();
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendVisible, setResendVisible] = useState(false);

  const searchParams = useSearchParams();
  const tempToken = searchParams.get("token");
  const email = searchParams.get("email");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ code: string }>();

  const handleCodeSubmit = async (values: { code: string }) => {
    setVerifyError(null);
    try {
      const res = await axiosInstance.post("/api/auth/verify-code", {
        code: values.code,
        tempToken,
      });

      const data = await res.data;

      if (data.status === "error") {
        setVerifyError("Invalid code");
        return;
      }

      const signInRes = await signIn("credentials", {
        redirect: false,
        user: JSON.stringify(data.data.user),
        backendTokens: JSON.stringify(data.data.backendTokens),
        permissions: JSON.stringify(data.data.permissions),
      });

      if (signInRes?.error) {
        setVerifyError(signInRes.error);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        console.error("Verification error:", error.response.data.error.message);
        setVerifyError(error.response.data.error.message);
        return {
          error: getErrorMessage(error.response.data.error.message),
        };
      } else {
        return {
          error: getErrorMessage(error),
        };
      }
    }
  };

  const handleResendCode = async () => {
    setResendError(null);

    const res = await axiosInstance.post("/api/auth/resend-code", {
      tempToken,
    });

    const data = await res.data;

    if (data.status === "error") {
      setResendError("Failed to resend code");
      return;
    }

    if (data.status === "success") {
      setResendVisible(true);
      setResendError(null);
    }

    // ✅ After first successful resend, permanently show the link
  };

  return (
    <div className="">
      <div className="flex items-center justify-center">
        <ApplicationLogo
          className="h-16 w-32 ml-2"
          src="https://res.cloudinary.com/dw1ltt9iz/image/upload/v1760181502/favicon_bp8qfr.svg"
          alt="Logo"
        />
      </div>
      <h1 className="text-3xl font-bold my-4 text-center">Hold up.</h1>
      <p className="text-center mb-6 text-sm">
        Protecting your account is one of our top priorities!
        <br />
        Please confirm your account by entering the authentication code sent to:
        <span className="font-semibold"> {email}</span>
      </p>

      <form
        onSubmit={handleSubmit(handleCodeSubmit)}
        className="space-y-4 sm:w-[70%] w-full mx-auto"
      >
        <Input
          type="text"
          placeholder="Enter 6-digit code"
          className="h-12 text-3xl"
          {...register("code", { required: true, minLength: 6, maxLength: 6 })}
        />

        {verifyError && <p className="text-red-500 text-sm">{verifyError}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full ">
          {isSubmitting ? "Verifying..." : "Verify Code"}
        </Button>
      </form>

      <div className="text-center text-sm mt-6">
        It may take a few minutes to receive your code.
        <DividerWithText className="my-4" />
        {!resendVisible ? (
          <Button
            variant="link"
            onClick={handleResendCode}
            className="text-blue-500 font-semibold text-sm"
          >
            Send me a new code
          </Button>
        ) : (
          <p className="text-green-600 font-semibold">
            Code resent successfully.
          </p>
        )}
        {resendError && <p className="text-red-500 text-sm">{resendError}</p>}
      </div>
    </div>
  );
}
