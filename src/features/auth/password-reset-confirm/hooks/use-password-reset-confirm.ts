"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { newPasswordSchema } from "../../password-reset/schema/password";

type NewPasswordValues = z.infer<typeof newPasswordSchema>;

export function usePasswordResetConfirm(token: string) {
  const axiosInstance = useAxiosAuth();
  const router = useRouter();

  const [error, setError] = useState("");

  const form = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = useCallback(
    async (values: NewPasswordValues): Promise<void> => {
      setError("");

      try {
        const res = await axiosInstance.post(`/api/auth/reset-password`, {
          password: values.password,
          passwordConfirmation: values.password_confirmation,
          token,
        });

        if (res.status === 200) {
          router.push("/login");
        }
      } catch (err) {
        if (isAxiosError(err) && err.response) {
          console.error("Password reset error response:", err.response);
          const msg =
            err.response.data?.error.message ?? "Failed to reset password";
          setError(getErrorMessage(msg));
          return;
        }
        setError(getErrorMessage(err));
      }
    },
    [axiosInstance, router, token],
  );

  return useMemo(
    () => ({
      form,
      error,
      onSubmit,
    }),
    [form, error, onSubmit],
  );
}
