"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PlusCircle } from "lucide-react";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useState } from "react";
import FormError from "@/components/ui/form-error";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";

interface CostCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  selected?: {
    id: string;
    name: string;
    code: string;
    budget: number;
  } | null;
}

const CostCenterSchema = z.object({
  budget: z.coerce.number().default(50),
  name: z.string({
    message: "Please enter a name",
  }),
  code: z.string({
    message: "code enter a name",
  }),
});

export const CostCenterModal = ({
  isOpen,
  onClose,
  isEditing,
  selected,
}: CostCenterModalProps) => {
  const [error, setError] = useState("");

  const createBonus = useCreateMutation<{
    code: string;
    name: string;
    budget: number;
  }>({
    endpoint: "/api/cost-centers",
    successMessage: "'cost centers added successfully!",
    refetchKey: "cost-centers onboarding payroll",
  });

  const updateCostCenter = useUpdateMutation({
    endpoint: `/api/cost-centers/${selected?.id}`,
    successMessage: "Cost center updated successfully",
    refetchKey: "cost-centers onboarding payroll",
  });

  const form = useForm<z.infer<typeof CostCenterSchema>>({
    resolver: zodResolver(CostCenterSchema),
    defaultValues: {
      name: selected?.name || "",
      code: selected?.code || "",
      budget: selected?.budget || 50,
    },
  });

  const onSubmit = async (values: z.infer<typeof CostCenterSchema>) => {
    if (isEditing) {
      await updateCostCenter(values, setError, onClose);
    } else {
      await createBonus(values, setError, form.reset, onClose);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      confirmText="Cost Center"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <section>
        {/* Available Deductions */}
        <h1 className="text-3xl font-bold flex items-center gap-2 my-2">
          <PlusCircle className="text-red-500" /> CostCenter
        </h1>
        <p className="text-gray-500 font-semibold">
          Manage your cost center settings here. You can add, edit, or delete
        </p>

        {/* Add New Deduction Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 my-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
          {error ? <FormError message={error} /> : ""}
        </Form>
      </section>
    </Modal>
  );
};
