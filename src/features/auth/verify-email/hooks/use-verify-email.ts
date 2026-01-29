"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { axiosInstance, isAxiosError } from "@/lib/axios";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { useToast } from "@/shared/hooks/use-toast";

import {
  verifyEmailSchema,
  type VerifyEmailValues,
} from "../schema/verify-email";

export function useVerifyEmail() {
  const router = useRouter();
  const { toast } = useToast();

  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  const form = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { token: "" },
  });

  const onSubmit = useCallback(
    async (values: VerifyEmailValues): Promise<void> => {
      setError(null);

      try {
        const res = await axiosInstance.post("/api/auth/verify-email", values);

        if (res.status === 201) {
          toast({
            variant: "success",
            title: "Email Verified",
            description: "Your email has been successfully verified!",
          });
          router.push("/login");
        }
      } catch (err) {
        if (isAxiosError(err) && err.response) {
          const msg =
            err.response.data?.error?.message ?? "Verification failed";
          setError(getErrorMessage(msg));
          return;
        }
        setError(getErrorMessage(err));
      }
    },
    [router, toast],
  );

  const resendOtp = useCallback(async (): Promise<void> => {
    setError(null);
    setResendSuccess(false);
    setResending(true);

    try {
      // Adjust endpoint to whatever your backend uses.
      // Common options: /api/auth/resend-verification-email or /api/auth/resend-email-otp
      const res = await axiosInstance.post("/api/resend-verify-email");

      if (res.status === 200 || res.status === 201) {
        setResendSuccess(true);
        toast({
          variant: "success",
          title: "Code Sent",
          description: "We’ve sent you a new verification code.",
        });
      } else {
        setError("Failed to resend code");
      }
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        const msg =
          err.response.data?.error?.message ?? "Failed to resend code";
        setError(getErrorMessage(msg));
        return;
      }
      setError(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  }, [toast]);

  return useMemo(
    () => ({
      form,
      error,
      onSubmit,
      resendOtp,
      resending,
      resendSuccess,
    }),
    [form, error, onSubmit, resendOtp, resending, resendSuccess],
  );
}
