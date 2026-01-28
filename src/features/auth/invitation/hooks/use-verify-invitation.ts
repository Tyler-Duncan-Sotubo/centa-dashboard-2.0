"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { passwordResetSchema } from "../../password-reset/schema/password";

type PasswordResetValues = z.infer<typeof passwordResetSchema>;

export function useVerifyInvitation(token: string) {
  const router = useRouter();
  const axiosInstance = useAxiosAuth();

  const [loading, setLoading] = useState(true); // initial verify loading
  const [error, setError] = useState("");

  const hasVerified = useRef(false);

  const form = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    if (!token) {
      setError("Invalid or expired invitation link.");
      setLoading(false);
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyInvite = async () => {
      try {
        const response = await axiosInstance.post(`/api/auth/invite/${token}`);

        if (response.data?.error) {
          throw new Error(response.data.error.message);
        }

        form.reset({
          email: response.data?.data?.email ?? "",
          password: "",
          password_confirmation: "",
        });
      } catch (err) {
        console.log(err);
        setError("Invalid or expired invitation.");
      } finally {
        setLoading(false);
      }
    };

    verifyInvite();
  }, [token, form, axiosInstance]);

  const onSubmit = useCallback(
    async (values: PasswordResetValues): Promise<void> => {
      // email is disabled but still validated; keep the guard anyway:
      if (!values.email || !values.password) {
        setError("Please enter both email and password");
        return;
      }

      setError("");

      try {
        const res = await axiosInstance.post(
          `/api/auth/invite-password-reset/${token}`,
          values,
          { withCredentials: true },
        );

        if (res.status === 200) {
          // Prefer relative path; no need for NEXT_PUBLIC_CLIENT_URL inside the client router push
          router.push("/auth/login");
        }
      } catch (err) {
        if (isAxiosError(err) && err.response) {
          const msg = err.response.data?.message ?? "Failed to reset password";
          setError(getErrorMessage(msg));
          return;
        }

        setError(getErrorMessage(err));
      }
    },
    [axiosInstance, router, token],
  );

  const goHome = useCallback(() => router.push("/"), [router]);

  return useMemo(
    () => ({
      form,
      loading,
      error,
      onSubmit,
      goHome,
    }),
    [form, loading, error, onSubmit, goHome],
  );
}
