"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import GenericSheet from "@/components/ui/generic-sheet";
import FormError from "@/components/ui/form-error";
import { Edit } from "lucide-react";
import { FaPlus } from "react-icons/fa";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { DateInput } from "@/components/ui/date-input";

const schema = z.object({
  name: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  reason: z.string().optional(),
});

export type BlockedDayForm = z.infer<typeof schema>;

export function BlockedDaysModal({
  isEditing = false,
  initialData,
  id,
}: {
  isEditing?: boolean;
  initialData?: BlockedDayForm;
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<BlockedDayForm>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: "",
      date: "",
      reason: "",
    },
  });

  const create = useCreateMutation({
    endpoint: "/api/blocked-days",
    successMessage: "Blocked day saved",
    refetchKey: "blocked-days",
    onSuccess: () => setIsOpen(false),
    onError: setError,
  });

  const update = useUpdateMutation({
    endpoint: `/api/blocked-days/${id}`,
    successMessage: "Blocked day updated",
    refetchKey: "blocked-days",
    onSuccess: () => setIsOpen(false),
    onError: setError,
  });

  const onSubmit = async (data: BlockedDayForm) => {
    if (isEditing) {
      await update(data, setError, form.reset);
    } else {
      await create(data, setError, form.reset);
    }
  };

  return (
    <GenericSheet
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        isEditing ? (
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
            <Edit size={20} />
          </Button>
        ) : (
          <div className="flex items-center justify-end">
            <Button onClick={() => setIsOpen(true)}>
              <FaPlus /> Add Blocked Day
            </Button>
          </div>
        )
      }
      title={isEditing ? "Edit Blocked Day" : "Add Blocked Day"}
      footer={
        <div className="flex justify-end gap-2 mt-6">
          {error && <FormError message={error} />}
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="blocked-day-form">
            {isEditing ? "Update" : "Save"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="blocked-day-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 mt-10"
        >
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Office Audit Day" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="date"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <DateInput
                    {...field}
                    onChange={(date) => field.onChange(date.toString())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="reason"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. System maintenance" />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </GenericSheet>
  );
}
