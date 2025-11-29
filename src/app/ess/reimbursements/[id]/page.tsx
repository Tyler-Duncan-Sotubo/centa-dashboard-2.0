/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";
import FormError from "@/components/ui/form-error";
import { FileUploadField } from "@/components/ess/FileUploadField";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import PageHeader from "@/components/pageHeader";
import NavBackButton from "@/components/ess/navigation/NavBackButton";
import useAxiosAuth from "@/hooks/useAxiosAuth";

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

const FormSchema = z.object({
  date: z.date(),
  category: z.enum(categories),
  purpose: z.string().min(2),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valid number required"),
  paymentMethod: z.enum(paymentMethods),
  receiptUrl: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export default function EditReimbursementPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: new Date(),
      category: "Travel",
      purpose: "",
      amount: "",
      paymentMethod: "Bank Transfer",
      receiptUrl: null,
    },
  });

  // Fetch existing data
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/api/expenses/${params.id}`);
        const r = res.data.data;
        form.reset({
          date: new Date(r.date),
          category: r.category,
          purpose: r.purpose,
          amount: r.amount,
          paymentMethod: r.paymentMethod,
          receiptUrl: r.receiptUrl,
        });
      } catch (error: any) {
        setError(
          error.response?.data?.message || "Failed to load reimbursement data."
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id && session?.backendTokens.accessToken) load();
  }, [params.id, session, form, axiosInstance]);

  const editReimbursement = useUpdateMutation({
    endpoint: `/api/expenses/${params.id}`,
    successMessage: "Reimbursement request updated",
    refetchKey: "reimbursements",
    onSuccess: () => {
      router.back();
    },
  });

  const onSubmit = async (values: FormValues) => {
    await editReimbursement(
      {
        ...values,
        employeeId: session?.user.id,
      },
      setError
    );
  };
  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl">
      <NavBackButton href="/ess/reimbursements">
        Back to Reimbursements
      </NavBackButton>
      <PageHeader
        title="Edit Reimbursement"
        description="Update your reimbursement request details."
        icon="💰"
      />
      <div>
        <div className="my-6">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            encType="multipart/form-data"
          >
            {/* Date */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" type="button" className="w-full">
                    {format(form.watch("date"), "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("date")}
                    onSelect={(d) => form.setValue("date", d as Date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Category</label>
              <Select
                value={form.watch("category")}
                onValueChange={(v) => form.setValue("category", v as any)}
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

            {/* Purpose */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Purpose</label>
              <Textarea {...form.register("purpose")} />
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Amount (₦)</label>
              <Input
                {...form.register("amount")}
                placeholder="60000"
                inputMode="decimal"
              />
            </div>

            {/* Payment Method */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Payment Method</label>
              <Select
                value={form.watch("paymentMethod")}
                onValueChange={(v) => form.setValue("paymentMethod", v as any)}
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

            {/* Receipt */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Receipt</label>
              <FileUploadField
                value={form.watch("receiptUrl") as string | null}
                onChange={(b64) => form.setValue("receiptUrl", b64)}
              />
            </div>

            {error && <FormError message={error} />}

            <Button type="submit" className="w-full">
              Update
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
