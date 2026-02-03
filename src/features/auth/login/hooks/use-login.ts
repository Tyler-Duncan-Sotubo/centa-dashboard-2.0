"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schema/login";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

type LoginValues = z.infer<typeof loginSchema>;

// ---- Robust response validation (bug-proofing) ----
const userSchema = z
  .object({
    id: z.any().optional(),
    userId: z.any().optional(),
    role: z.union([z.string(), z.array(z.string())]).optional(),
    employmentStatus: z.string().optional(),
  })
  // allow extra fields from backend
  .passthrough();

const loginResponseSchema = z
  .object({
    error: z.string().optional(),
    tempToken: z.string().optional(),
    user: userSchema.optional(),
    backendTokens: z.any().optional(),
    permissions: z.any().optional(),
    checklist: z.any().optional(),
  })
  .passthrough();

type CustomLoginResponse = z.infer<typeof loginResponseSchema>;

const ADMIN_ROLES = ["admin", "super_admin", "hr_manager", "manager"] as const;

function computeIsAdmin(role: unknown): boolean {
  // role can be string | string[] | undefined | other
  const roles: string[] = Array.isArray(role)
    ? role.filter((r): r is string => typeof r === "string")
    : typeof role === "string"
      ? [role]
      : [];

  return roles.some((r) =>
    (ADMIN_ROLES as readonly string[]).includes(r.toLowerCase()),
  );
}

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
        // 0) Clear any cross-user persisted UI state BEFORE anything else
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("workspace");
        }

        // 1) Clear NextAuth session to prevent role/token "stickiness"
        await signOut({ redirect: false });

        const response = await fetch("/api/custom-login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
          headers: { "Content-Type": "application/json" },
        });

        const raw: unknown = await response.json();
        const parsed = loginResponseSchema.safeParse(raw);

        if (!parsed.success) {
          setError("Login failed: Please try again");
          return;
        }

        const data: CustomLoginResponse = parsed.data;

        // Handle non-2xx
        if (!response.ok) {
          setError(data?.error ?? "Login failed");
          return;
        }

        // Handle backend-supplied error
        if (data.error) {
          setError(data.error);
          return;
        }

        // 2FA flow
        if (data.tempToken) {
          router.replace(
            `/2fa?token=${data.tempToken}&email=${encodeURIComponent(email)}`,
          );
          return;
        }

        if (!data.user) {
          setError("Login failed: missing user data");
          return;
        }

        const isAdmin = computeIsAdmin(data.user.role);

        // Normalize for non-admin users
        const userForNextAuth = isAdmin
          ? data.user
          : {
              ...data.user,
              employeeId: data.user.id,
              userAccountId: data.user.userId ?? null,
            };

        // 3) Clear again RIGHT BEFORE signIn, to guarantee a clean slate
        // (prevents "manager" workspace carrying into the next session hydration)
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("workspace");
        }

        const signInResult = await signIn("credentials", {
          redirect: false,
          user: JSON.stringify(userForNextAuth),
          backendTokens: JSON.stringify(data.backendTokens ?? null),
          permissions: JSON.stringify(data.permissions ?? null),
          checklist: JSON.stringify(data.checklist ?? null),
        });

        if (signInResult?.error) {
          setError(getErrorMessage(signInResult.error));
          return;
        }

        if (signInResult?.ok) {
          const destination = isAdmin
            ? "/dashboard"
            : userForNextAuth.employmentStatus === "onboarding"
              ? "/onboarding"
              : "/ess";

          router.replace(destination);
          return;
        }

        setError("Login failed");
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
