"use client";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import type { UseFormReturn } from "react-hook-form";

type TwoFAFormValues = { code: string };

export function TwoFAForm({
  form,
  onSubmit,
  verifyError,
}: {
  form: UseFormReturn<TwoFAFormValues>;
  onSubmit: (values: TwoFAFormValues) => Promise<void> | void;
  verifyError: string | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 sm:w-[70%] w-full mx-auto"
    >
      <Input
        type="text"
        placeholder="Enter 6-digit code"
        className="h-12 text-3xl"
        {...register("code", { required: true, minLength: 6, maxLength: 6 })}
      />

      {verifyError && <p className="text-red-500 text-sm">{verifyError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Verifying..." : "Verify Code"}
      </Button>
    </form>
  );
}
