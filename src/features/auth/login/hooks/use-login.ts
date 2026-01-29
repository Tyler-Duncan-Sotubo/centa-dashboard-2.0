"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schema/login";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

type LoginValues = z.infer<typeof loginSchema>;

type CustomLoginResponse = {
  error?: string;
  tempToken?: string;
  user?: any;
  backendTokens?: any;
  permissions?: any;
  checklist?: any;
};

const ADMIN_ROLES = ["admin", "super_admin"] as const;

export function useLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = useCallback(
    async (email: string, password: string): Promise<void> => {
      setError(null);

      try {
        const response = await fetch("/api/custom-login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
          headers: { "Content-Type": "application/json" },
        });

        const data: CustomLoginResponse = await response.json();

        if (!response.ok) {
          setError(data?.error ?? "Login failed");
          return;
        }

        if (data.error) {
          setError(data.error);
          return;
        }

        // 2FA
        if (data.tempToken) {
          router.push(
            `/2fa?token=${data.tempToken}&email=${encodeURIComponent(email)}`,
          );
          return;
        }

        if (!data.user) {
          setError("Login failed: missing user data");
          return;
        }

        const isAdmin = ADMIN_ROLES.includes(data.user.role);

        // Normalize for non-admin users
        const userForNextAuth = isAdmin
          ? data.user
          : {
              ...data.user,
              employeeId: data.user.id,
              userAccountId: data.user.userId ?? null,
            };

        const signInResult = await signIn("credentials", {
          redirect: false,
          user: JSON.stringify(userForNextAuth),
          backendTokens: JSON.stringify(data.backendTokens),
          permissions: JSON.stringify(data.permissions),
          checklist: JSON.stringify(data.checklist),
        });

        if (signInResult?.error) {
          setError(getErrorMessage(signInResult.error));
          return;
        }

        if (signInResult?.ok) {
          if (isAdmin) {
            router.push("/dashboard");
          } else {
            const destination =
              data.user.employmentStatus === "onboarding"
                ? "/onboarding"
                : "/ess";
            router.push(destination);
          }
        }
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
    [router],
  );

  const onSubmit = useCallback(
    async (values: LoginValues): Promise<void> => {
      await handleLogin(values.email, values.password);
    },
    [handleLogin],
  );

  return useMemo(
    () => ({
      form,
      error,
      onSubmit,
      setError,
    }),
    [form, error, onSubmit],
  );
}
