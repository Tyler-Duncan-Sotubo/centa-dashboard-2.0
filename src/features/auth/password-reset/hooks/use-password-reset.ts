"use client";

import { useState, useCallback, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { requestPasswordResetSchema } from "../schema/password";

type PasswordResetValues = z.infer<typeof requestPasswordResetSchema>;

export function usePasswordReset() {
  const axiosInstance = useAxiosAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const form = useForm<PasswordResetValues>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = useCallback(
    async (values: PasswordResetValues): Promise<void> => {
      setError("");

      try {
        const res = await axiosInstance.post(
          `/api/auth/password-reset`,
          values,
          {
            withCredentials: true,
          },
        );

        if (res.status === 201) setSuccess(true);
      } catch (err) {
        if (isAxiosError(err) && err.response) {
          const msg = err.response.data?.message ?? "Failed to send reset link";
          setError(getErrorMessage(msg));
          return;
        }

        setError(getErrorMessage(err));
      }
    },
    [axiosInstance],
  );

  const resetFlow = useCallback(() => {
    setSuccess(false);
    setError("");
    form.reset();
  }, [form]);

  return useMemo(
    () => ({
      form,
      error,
      success,
      onSubmit,
      resetFlow,
    }),
    [form, error, success, onSubmit, resetFlow],
  );
}
