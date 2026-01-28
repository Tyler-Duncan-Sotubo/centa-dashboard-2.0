"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { Calendar } from "@/shared/ui/calendar";
import FormError from "@/shared/ui/form-error";
import { FileUploadField } from "@/features/ess-layout/ui/FileUploadField";
import PageHeader from "@/shared/ui/page-header";
import NavBackButton from "@/features/ess-layout/ui/NavBackButton";
import { useReimbursementForm } from "../hooks/use-reimbursement-form";
import { useCreateReimbursement } from "../hooks/use-submit-reimbursement";
import { categories, paymentMethods } from "../schema/reimbursement.schema";

export default function NewReimbursementClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [openCal, setOpenCal] = useState(false);

  const form = useReimbursementForm();
  const create = useCreateReimbursement();

  const onSubmit = async (values: any) => {
    await create(
      { ...values, employeeId: session?.user.id },
      setError,
      form.reset,
    );
    router.push("/ess/reimbursements");
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <label className="font-semibold">Purpose / description</label>
              <Textarea {...form.register("purpose")} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Amount (NGN)</label>
              <Input {...form.register("amount")} inputMode="decimal" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Payment method</label>
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
              <label className="font-semibold">Receipt (optional)</label>
              <FileUploadField
                value={form.watch("receiptUrl") as string | null}
                onChange={(b64) => form.setValue("receiptUrl", b64)}
              />
            </div>

            {error && <FormError message={error} />}

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
