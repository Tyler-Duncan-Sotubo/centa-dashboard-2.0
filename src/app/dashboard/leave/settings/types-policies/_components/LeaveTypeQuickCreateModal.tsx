"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import FormError from "@/components/ui/form-error";
import { HexColorPicker } from "react-colorful";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  isPaid: z.boolean(),
  colorTag: z.string().optional(),
});

type LeaveTypeForm = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const LeaveTypeQuickCreateModal = ({ isOpen, onClose, onCreated }: Props) => {
  const [error, setError] = useState("");

  const form = useForm<LeaveTypeForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      isPaid: true,
      colorTag: "#007bff",
    },
  });

  const createLeaveType = useCreateMutation({
    endpoint: "/api/leave-types",
    successMessage: "Leave type added",
    refetchKey: "leave-types",
    onSuccess: () => {
      form.reset();
      onCreated?.();
      onClose();
    },
    onError: setError,
  });

  const onSubmit = async (data: LeaveTypeForm) => {
    await createLeaveType(data, setError);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Leave Type"
      confirmText="Add"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-6">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Compassionate Leave" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="isPaid"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Is Paid?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "true")}
                    defaultValue={String(field.value)}
                    className="flex space-x-4"
                  >
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="true" />
                      </FormControl>
                      <FormLabel>Yes</FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="false" />
                      </FormControl>
                      <FormLabel>No</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="colorTag"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color Tag</FormLabel>
                <div className="flex items-center space-x-4">
                  <div className="w-[250px]">
                    <HexColorPicker
                      color={field.value}
                      onChange={field.onChange}
                      className="rounded-md border shadow-md"
                    />
                  </div>
                  <div className="w-[90px]">
                    <Input
                      {...field}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                  <div
                    className="w-8 h-8 rounded-full border shadow"
                    style={{ backgroundColor: field.value }}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      {error && <FormError message={error} />}
    </Modal>
  );
};

export default LeaveTypeQuickCreateModal;
