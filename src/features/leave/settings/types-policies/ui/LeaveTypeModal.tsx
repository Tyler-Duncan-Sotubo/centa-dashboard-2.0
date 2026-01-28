"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaPlus } from "react-icons/fa";
import { Button } from "@/shared/ui/button";
import GenericSheet from "@/shared/ui/generic-sheet";
import { Input } from "@/shared/ui/input";
import FormError from "@/shared/ui/form-error";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { HexColorPicker } from "react-colorful";
import { LeaveType } from "@/features/leave/types/leave.type";
import { Edit } from "lucide-react";

const createLeaveTypeSchema = z.object({
  name: z.string().min(1, "Leave name is required"),
  isPaid: z.boolean(),
  colorTag: z.string().optional(),
});

type LeaveTypeForm = z.infer<typeof createLeaveTypeSchema>;

const LeaveTypeModal = ({
  isEditing = false,
  initialData,
}: {
  isEditing?: boolean;
  initialData?: LeaveType;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<LeaveTypeForm>({
    resolver: zodResolver(createLeaveTypeSchema),
    defaultValues: initialData || {
      name: "",
      isPaid: true,
      colorTag: "#58D68D",
    },
  });

  useEffect(() => {
    if (isEditing && initialData) {
      form.reset(initialData);
    }
  }, [isEditing, form, initialData]);

  const createLeaveType = useCreateMutation({
    endpoint: "/api/leave-types",
    successMessage: "Leave type created successfully",
    refetchKey: "leave-types",
    onSuccess: () => {
      setIsOpen(false);
    },
    onError: setError,
  });

  const onSubmit = (data: LeaveTypeForm) => {
    createLeaveType(data, setError, form.reset);
  };

  return (
    <GenericSheet
      trigger={
        <span>
          {isEditing ? (
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
              <Edit size={24} />
            </Button>
          ) : (
            <Button onClick={() => setIsOpen(true)}>
              <FaPlus />
              Add Leave Type
            </Button>
          )}
        </span>
      }
      open={isOpen}
      onOpenChange={setIsOpen}
      title={isEditing ? "Edit Leave Type" : "Create Leave Type"}
      footer={
        <div className="flex justify-end gap-2 my-10">
          {error && <FormError message={error} />}
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button form="leave-type-form" type="submit">
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="leave-type-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-10 mt-4"
        >
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Sick Leave" />
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
                  <div className="w-62.5">
                    <HexColorPicker
                      color={field.value}
                      onChange={field.onChange}
                      className="rounded-md border shadow-md"
                    />
                  </div>
                  <div className="w-22.5">
                    <Input
                      {...field}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                  <div
                    className="w-8 h-8 rounded-full border shadow-xs"
                    style={{ backgroundColor: field.value }}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </GenericSheet>
  );
};

export default LeaveTypeModal;
