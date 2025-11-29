"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import FormError from "@/components/ui/form-error";
import { FileUploadField } from "@/components/ess/FileUploadField";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/pageHeader";
import NavBackButton from "@/components/ess/navigation/NavBackButton";

const categories = [
  "Travel",
  "Meals",
  "Supplies",
  "Transport",
  "Accommodation",
  "Entertainment",
  "Other",
] as const;

const paymentMethods = [
  "Bank Transfer",
  "Cash",
  "Credit Card",
  "Company Card",
  "Mobile Money",
] as const;

/* ---------- Zod schema ---------- */
const ReimbursementSchema = z.object({
  date: z.date(),
  category: z.enum(categories),
  purpose: z.string().min(3, "Purpose is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Valid number"),
  paymentMethod: z.enum(paymentMethods),
  receiptUrl: z.string().nullable().optional(), // ✔ base64 or null
});
type FormValues = z.infer<typeof ReimbursementSchema>;

export default function NewReimbursementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [openCal, setOpenCal] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(ReimbursementSchema),
    defaultValues: {
      date: new Date(),
      category: "Travel",
      purpose: "",
      amount: "",
      paymentMethod: "Bank Transfer",
      receiptUrl: null,
    },
  });

  const requestReimbursement = useCreateMutation({
    endpoint: "/api/expenses",
    successMessage: "Reimbursement request submitted successfully!",
    refetchKey: "reimbursements",
    onSuccess: () => {
      router.push("/ess/reimbursements");
    },
  });

  const onSubmit = async (values: FormValues) => {
    await requestReimbursement(
      {
        ...values,
        employeeId: session?.user.id,
      },
      setError
    );
  };

  return (
    <div className="max-w-2xl">
      <NavBackButton href="/ess/reimbursements">
        Back to Reimbursements
      </NavBackButton>
      <PageHeader
        title="Request Reimbursement"
        description="Submit a new reimbursement request for expenses incurred."
        icon="💰"
      />

      <div className="my-6">
        <CardContent className="p-0">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            encType="multipart/form-data"
          >
            {/* 📅 Date */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Expense date</label>
              <Popover open={openCal} onOpenChange={setOpenCal}>
                <PopoverTrigger asChild>
                  <Button variant="outline" type="button" className="w-full">
                    {format(form.watch("date"), "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("date")}
                    onSelect={(d) => {
                      form.setValue("date", d as Date);
                      setOpenCal(false);
                    }}
                    disabled={(d) => d > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 🏷 Category */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Category</label>
              <Select
                value={form.watch("category")}
                onValueChange={(v) =>
                  form.setValue("category", v as (typeof categories)[number])
                }
              >
                <SelectTrigger>{form.watch("category")}</SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 📝 Purpose */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Purpose / description</label>
              <Textarea
                {...form.register("purpose")}
                placeholder="e.g. Client visit transport"
              />
            </div>

            {/* 💰 Amount */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Amount (NGN)</label>
              <Input
                {...form.register("amount")}
                placeholder="15000"
                type="number"
                inputMode="decimal"
              />
            </div>

            {/* 💳 Payment method */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Payment method</label>
              <Select
                value={form.watch("paymentMethod")}
                onValueChange={(v) =>
                  form.setValue(
                    "paymentMethod",
                    v as (typeof paymentMethods)[number]
                  )
                }
              >
                <SelectTrigger>{form.watch("paymentMethod")}</SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 📎 Receipt upload */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Receipt (optional)</label>
              <FileUploadField
                value={form.watch("receiptUrl") as string | null}
                onChange={(b64) => form.setValue("receiptUrl", b64)}
              />
            </div>

            {/* Error */}
            {error && <FormError message={error} />}

            {/* Submit */}
            <Button
              className="w-full"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Submitting..." : "Submit request"}
            </Button>
          </form>
        </CardContent>
      </div>
    </div>
  );
}
