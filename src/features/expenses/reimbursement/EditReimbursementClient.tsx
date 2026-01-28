/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Loading from "@/shared/ui/loading";
import FormError from "@/shared/ui/form-error";
import { FileUploadField } from "@/features/ess-layout/ui/FileUploadField";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Input } from "@/shared/ui/input";
import PageHeader from "@/shared/ui/page-header";
import NavBackButton from "@/features/ess-layout/ui/NavBackButton";
import { useReimbursementForm } from "../hooks/use-reimbursement-form";
import { useReimbursement } from "../hooks/use-reimbursement";
import { useUpdateReimbursement } from "../hooks/use-submit-reimbursement";
import { categories, paymentMethods } from "../schema/reimbursement.schema";

export default function EditReimbursementClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  const form = useReimbursementForm();
  const reimbursementQuery = useReimbursement(id);
  const update = useUpdateReimbursement(id);

  useEffect(() => {
    const r: any = reimbursementQuery.data;
    if (!r) return;

    form.reset({
      date: new Date(r.date),
      category: r.category,
      purpose: r.purpose,
      amount: r.amount,
      paymentMethod: r.paymentMethod,
      receiptUrl: r.receiptUrl,
    });
  }, [reimbursementQuery.data, form]);

  const onSubmit = async (values: any) => {
    await update({ ...values, employeeId: session?.user.id }, setError);
    router.back();
  };

  if (reimbursementQuery.isLoading) return <Loading />;
  if (reimbursementQuery.isError) return <div>Error loading reimbursement</div>;

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

      <div className="my-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          <div className="flex flex-col gap-2">
            <label className="font-semibold">Purpose</label>
            <Textarea {...form.register("purpose")} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold">Amount (₦)</label>
            <Input {...form.register("amount")} inputMode="decimal" />
          </div>

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

          <div className="flex flex-col gap-2">
            <label className="font-semibold">Receipt</label>
            <FileUploadField
              value={form.watch("receiptUrl") as string | null}
              onChange={(b64) => form.setValue("receiptUrl", b64)}
            />
          </div>

          {error && <FormError message={error} />}

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Updating..." : "Update"}
          </Button>
        </form>
      </div>
    </div>
  );
}
