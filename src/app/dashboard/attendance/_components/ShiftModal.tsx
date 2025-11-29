"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Modal from "@/components/ui/modal";
import { isAxiosError } from "@/lib/axios";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import Loading from "@/components/ui/loading";
import FormError from "@/components/ui/form-error";
import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Shift } from "@/types/shift.type";
import useAxiosAuth from "@/hooks/useAxiosAuth";

// Schema
const shiftSchema = z.object({
  shiftId: z.string().min(1, "Shift is required"),
});

type ShiftForm = z.infer<typeof shiftSchema>;

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  initialData?: {
    employeeId: string;
    shiftId: string;
    date: string;
    employeeName: string;
    locationId: string;
  };
  id?: string;
}

const ShiftModal = ({
  isOpen,
  onClose,
  isEditing = false,
  initialData,
  id,
}: ShiftModalProps) => {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const [error, setError] = useState("");

  const form = useForm<ShiftForm>({
    resolver: zodResolver(shiftSchema),
    defaultValues: initialData || {},
  });

  const fetchShifts = async () => {
    try {
      const res = await axiosInstance.get("/api/shifts");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error)) return [];
    }
  };

  const { data, isLoading } = useQuery<Shift[]>({
    queryKey: ["shifts"],
    queryFn: fetchShifts,
    staleTime: 1000 * 60 * 5,
    enabled: !!session?.backendTokens.accessToken && isOpen,
  });

  useEffect(() => {
    if (isEditing && initialData) {
      form.reset(initialData);
    }
  }, [isEditing, initialData, form]);

  const update = useUpdateMutation({
    endpoint: `/api/shifts/${id}`,
    successMessage: "Shift updated",
    refetchKey: "employee-shifts",
  });

  const create = useCreateMutation({
    endpoint: `/api/employee-shifts/${initialData?.employeeId}`,
    successMessage: "Shift created",
    refetchKey: "employee-shifts",
  });

  const onSubmit = async (data: ShiftForm) => {
    if (isEditing && id) {
      await update(
        {
          shiftId: data.shiftId,
          shiftDate: initialData?.date,
        },
        setError,
        onClose
      );
    } else {
      await create(
        {
          shiftId: data.shiftId,
          shiftDate: initialData?.date,
        },
        setError,
        form.reset,
        onClose
      );
    }
  };

  if (isLoading) return <Loading />;

  const filteredShifts = data?.filter((shift) => {
    return initialData?.locationId === shift.locationId;
  });

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
                <FormLabel required>Employee</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredShifts?.map((shift) => (
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
};

export default ShiftModal;
