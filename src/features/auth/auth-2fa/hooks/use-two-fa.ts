"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";

import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

type TwoFAFormValues = { code: string };

export function useTwoFA() {
  const axiosInstance = useAxiosAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tempToken = searchParams.get("token");
  const email = searchParams.get("email");

  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendVisible, setResendVisible] = useState(false);

  const form = useForm<TwoFAFormValues>();

  const handleCodeSubmit = useCallback(
    async (values: TwoFAFormValues): Promise<void> => {
      setVerifyError(null);

      try {
        const res = await axiosInstance.post("/api/auth/verify-code", {
          code: values.code,
          tempToken,
        });

        const data = res.data;

        if (data?.status === "error") {
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
          const msg =
            error.response.data?.error?.message ?? "Verification failed";
          setVerifyError(getErrorMessage(msg));
          return;
        }

        setVerifyError(getErrorMessage(error));
      }
    },
    [axiosInstance, router, tempToken],
  );

  const handleResendCode = useCallback(async () => {
    setResendError(null);

    try {
      const res = await axiosInstance.post("/api/auth/resend-code", {
        tempToken,
      });
      const data = res.data;

      if (data?.status === "error") {
        setResendError("Failed to resend code");
        return;
      }

      setResendVisible(true);
    } catch (error) {
      setResendError(getErrorMessage(error));
    }
  }, [axiosInstance, tempToken]);

  return useMemo(
    () => ({
      email,
      tempToken,
      form,
      verifyError,
      resendError,
      resendVisible,
      setResendVisible,
      handleCodeSubmit,
      handleResendCode,
    }),
    [
      email,
      tempToken,
      form,
      verifyError,
      resendError,
      resendVisible,
      handleCodeSubmit,
      handleResendCode,
    ],
  );
}
