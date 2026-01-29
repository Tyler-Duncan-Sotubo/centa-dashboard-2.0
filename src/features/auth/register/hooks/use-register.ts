"use client";

import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useToast } from "@/shared/hooks/use-toast";
import { isAxiosError } from "@/lib/axios";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

import { RegisterSchema } from "../schema/register";

export type RegisterValues = z.infer<typeof RegisterSchema>;

export function useRegister() {
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [stage, setStage] = useState<0 | 1>(0);
  const [error, setError] = useState<string | null>(null); // API/server error
  const [stageError, setStageError] = useState<string | null>(null); // local stage check error

  const form = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      companyName: "",
      country: undefined as unknown as RegisterValues["country"],
      role: undefined as unknown as RegisterValues["role"],
      terms: true,
    },
    mode: "onSubmit",
  });

  const basicStageOneCheck = useCallback(
    (values: RegisterValues): string | null => {
      const { firstName, lastName, email, password, passwordConfirmation } =
        values;

      if (
        !firstName?.trim() ||
        !lastName?.trim() ||
        !email?.trim() ||
        !password ||
        !passwordConfirmation
      ) {
        return "Please fill in all required fields.";
      }

      const emailOk = /\S+@\S+\.\S+/.test(email);
      if (!emailOk) return "Please enter a valid email address.";

      if (password.length < 8) return "Password must be at least 8 characters.";
      if (password !== passwordConfirmation) return "Passwords do not match.";

      return null;
    },
    [],
  );

  const handleNext = useCallback(() => {
    setStageError(null);
    const values = form.getValues();

    const err = basicStageOneCheck(values);
    if (err) {
      setStageError(err);
      return;
    }
    setStage(1);
  }, [form, basicStageOneCheck]);

  const handleBack = useCallback(() => {
    setStageError(null);
    setStage(0);
  }, []);

  const onSubmit = useCallback(
    async (values: RegisterValues): Promise<void> => {
      setError(null);

      const domain = values.companyName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      try {
        const res = await axiosInstance.post(
          "/api/auth/register",
          { ...values, domain },
          { withCredentials: true },
        );

        if (res.status === 201) {
          toast({ variant: "success", title: "Account Created" });
          router.push(`/verify-email`);
        }
      } catch (err) {
        if (isAxiosError(err) && err.response) {
          const msg =
            err.response.data?.error?.message ?? "Registration failed";
          setError(getErrorMessage(msg));
          return;
        }
        setError(getErrorMessage(err));
      }
    },
    [axiosInstance, router, toast],
  );

  return useMemo(
    () => ({
      form,
      stage,
      error,
      stageError,
      handleNext,
      handleBack,
      onSubmit,
    }),
    [form, stage, error, stageError, handleNext, handleBack, onSubmit],
  );
}
