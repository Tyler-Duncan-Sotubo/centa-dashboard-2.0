"use client";

import { useEffect, useState } from "react";
import Modal from "@/shared/ui/modal";
import Loading from "@/shared/ui/loading";
import FormError from "@/shared/ui/form-error";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
} from "@/shared/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";

import type { Shift } from "@/types/shift.type";
import {
  shiftModalSchema,
  type ShiftModalSchema,
} from "../schema/shift-modal.schema";
import { useShiftsQuery } from "../hooks/use-shifts-query";
import { useCreateEmployeeShift } from "../hooks/use-create-employee-shift";
import { useUpdateShift } from "../hooks/use-update-shift";
import type { CreateShiftEventPrefill } from "../types/shift-event.type";

export function ShiftModal({
  isOpen,
  onClose,
  isEditing = false,
  initialData,
  id,
}: {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  initialData?: CreateShiftEventPrefill;
  id?: string;
}) {
  const [error, setError] = useState("");

  const form = useForm<ShiftModalSchema>({
    resolver: zodResolver(shiftModalSchema),
    defaultValues: initialData
      ? { shiftId: initialData.shiftId }
      : { shiftId: "" },
  });

  const { data: shifts, isLoading } = useShiftsQuery(isOpen);

  useEffect(() => {
    if (isEditing && initialData) form.reset({ shiftId: initialData.shiftId });
  }, [isEditing, initialData, form]);

  const { updateShift } = useUpdateShift(id);
  const { createEmployeeShift } = useCreateEmployeeShift(
    initialData?.employeeId,
  );

  const filteredShifts = (shifts ?? []).filter(
    (shift) => initialData?.locationId === shift.locationId,
  );

  const onSubmit = async (values: ShiftModalSchema) => {
    if (!initialData?.date) return;

    if (isEditing && id) {
      await updateShift(
        { shiftId: values.shiftId, shiftDate: initialData.date },
        setError,
        onClose,
      );
      return;
    }

    await createEmployeeShift(
      { shiftId: values.shiftId, shiftDate: initialData.date },
      setError,
      form.reset,
      onClose,
    );
  };

  if (isLoading) return <Loading />;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Shift" : "Add Shift"}
      confirmText={isEditing ? "Update" : "Create"}
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-6">
          <div>
            <h2 className="text-lg font-semibold">
              Select Shift for {initialData?.employeeName}
            </h2>
            <p className="text-sm text-gray-500">
              Choose a shift from the list below.
            </p>
          </div>

          <FormField
            name="shiftId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Shift</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredShifts.map((shift: Shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {shift.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {error && <FormError message={error} />}
    </Modal>
  );
}
