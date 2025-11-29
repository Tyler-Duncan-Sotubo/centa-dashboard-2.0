/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import DynamicField from "./DynamicField";
import { ChecklistItem } from "@/types/onboarding.type";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function StepForm({
  item,
  maxStep,
  onPrev,
  onNext,
}: {
  item: ChecklistItem;
  maxStep: number; // this should be the HIGHEST order value or total count (see label below)
  onPrev: () => void;
  onNext: (answers: Record<string, any>) => void;
}) {
  const { toast } = useToast();

  const [isVerifying, setIsVerifying] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);

  // Build Zod schema from the fields (with real "required" enforcement)
  const buildSchema = (fields: ChecklistItem["fields"]) => {
    const shape: Record<string, z.ZodTypeAny> = {};

    fields.forEach((f) => {
      let base: z.ZodTypeAny;

      switch (f.fieldType) {
        case "text":
        case "select":
          base = z.string();
          break;

        case "date":
          base = z
            .string()
            .refine((d) => !isNaN(Date.parse(d)), { message: "Invalid date" });
          break;

        case "file":
          // Accept File, string (URL/key), or an object with url/key
          base = z
            .any()
            .refine(
              (v) =>
                v != null &&
                (typeof v === "string" ||
                  (typeof File !== "undefined" && v instanceof File) ||
                  (typeof v === "object" && ("url" in v || "key" in v))),
              { message: "Required" }
            );
          break;

        default:
          base = z.string();
      }

      if (f.required) {
        // For strings, make sure it's not empty
        if (base instanceof z.ZodString) {
          shape[f.fieldKey] = base.min(1, { message: "Required" });
        } else {
          shape[f.fieldKey] = base;
        }
      } else {
        shape[f.fieldKey] = base.optional();
      }
    });

    return z.object(shape);
  };

  const schema = useMemo(() => buildSchema(item.fields), [item.fields]);
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {},
    mode: "onChange", // live validity
    reValidateMode: "onChange",
    criteriaMode: "all",
  });

  // Watch bank fields for verification
  const bankName = form.watch("bankName" as any);
  const bankAccountNumber = form.watch("bankAccountNumber" as any);

  const verifyBankDetails = async (accountNumber: string, bankCode: string) => {
    if (!accountNumber || !bankCode) return;

    setIsVerifying(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/employee-finance/verify-account/${accountNumber}/${bankCode}`
      );

      if (res.data?.status) {
        form.setValue("bankAccountName" as any, res.data.data.account_name, {
          shouldValidate: true,
          shouldTouch: true,
          shouldDirty: true,
        });
        toast({
          variant: "success",
          title: "Account Verified",
          description: `Account Name: ${res.data.data.account_name}`,
        });
        setBankError(null);
      } else {
        setBankError("Invalid account details. Please check again.");
      }
    } catch (err) {
      getErrorMessage(err);
      // setBankError("Failed to verify account. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Debounce bank verification
  useEffect(() => {
    if (!bankName && !bankAccountNumber) return;
    const t = setTimeout(
      () => verifyBankDetails(bankAccountNumber, bankName),
      800
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankName, bankAccountNumber]);

  const submit = (values: FormValues) => onNext(values);

  const isFirstStep = item.order <= 0;
  const isLastStep = item.order === maxStep; // assumes maxStep is the HIGHEST `order` value

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="space-y-6 max-w-2xl"
      >
        {item.fields.map((f) => {
          const isBankField =
            f.fieldKey === "bankName" || f.fieldKey === "bankAccountNumber";
          const isAccountName = f.fieldKey === "bankAccountName";

          return (
            <FormField
              key={f.id}
              control={form.control}
              name={f.fieldKey as keyof FormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required={f.required}>{f.label}</FormLabel>
                  <FormControl>
                    <DynamicField
                      field={f}
                      value={field.value}
                      onChange={field.onChange}
                      // Show verifying only on related fields
                      disabled={isVerifying && (isBankField || isAccountName)}
                      // Show verification error only on bank fields
                      error={isBankField ? bankError : null}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={isFirstStep}
            onClick={onPrev}
          >
            Previous
          </Button>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {isLastStep ? "Finish" : "Next"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
