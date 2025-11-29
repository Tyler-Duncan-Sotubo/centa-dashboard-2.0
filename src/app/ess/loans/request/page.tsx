"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import PageHeader from "@/components/pageHeader";
import NavBackButton from "@/components/ess/navigation/NavBackButton";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than zero"),
  tenureMonths: z.coerce.number().min(1, "Tenure must be at least 1 month"),
  preferredMonthlyPayment: z.coerce
    .number()
    .min(1, "Preferred monthly payment is required"),
});

type FormData = z.infer<typeof schema>;

export default function SalaryAdvanceRequestPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      amount: 0,
      tenureMonths: 0,
      preferredMonthlyPayment: 0,
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { isSubmitting },
  } = form;

  const requestAdvance = useCreateMutation({
    endpoint: `/api/salary-advance/request/${session?.user.id}`,
    successMessage: "Salary advance requested successfully",
    refetchKey: "salary-advances",
    onSuccess() {
      router.push("/ess/loans");
    },
  });

  const onSubmit = async (values: FormData) => {
    if (
      values.preferredMonthlyPayment * values.tenureMonths !==
      values.amount
    ) {
      setError("preferredMonthlyPayment", {
        type: "manual",
        message: "Monthly payment × tenure must equal total amount",
      });
      return;
    }

    await requestAdvance(values, (err: string) =>
      setError("name", { type: "manual", message: err })
    );
  };

  return (
    <div className="max-w-xl space-y-6">
      <NavBackButton href="/ess/loans">Back to Loans</NavBackButton>
      <PageHeader
        title="Salary Advance Request"
        description="Apply for a salary advance by filling in the form below."
      />

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. School Fees" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="tenureMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tenure (months)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="preferredMonthlyPayment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Monthly Payment</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 1000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </Form>

      <p className="text-sm text-muted-foreground">
        Note: Preferred monthly payment × tenure must equal the total loan
        amount.
      </p>
    </div>
  );
}
