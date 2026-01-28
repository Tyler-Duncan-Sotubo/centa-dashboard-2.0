"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/shared/ui/form";
import GenericSheet from "@/shared/ui/generic-sheet";
import FormError from "@/shared/ui/form-error";
import { Edit } from "lucide-react";
import { FaPlus } from "react-icons/fa";
import Loading from "@/shared/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { LeaveType } from "@/features/leave/types/leave.type";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { DateInput } from "@/shared/ui/date-input";
import { EmployeeSingleSelect } from "@/shared/ui/employee-single-select";

const schema = z.object({
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  reason: z.string().optional(),
  leaveTypeId: z.string().min(1, "Leave type is required"),
  employeeId: z.string().min(1, "Employee is required"),
});

type ReservedDayForm = z.infer<typeof schema>;

export function ReservedDaysModal({
  isEditing = false,
  initialData,
}: {
  isEditing?: boolean;
  initialData?: ReservedDayForm;
}) {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<ReservedDayForm>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      startDate: "",
      endDate: "",
      reason: "",
      leaveTypeId: "",
      employeeId: "",
    },
  });

  const fetchLeaveTypes = async () => {
    try {
      const res = await axiosInstance.get("/api/leave-types");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: leaveTypes,
    isLoading: isLoadingLeaveTypes,
    isError: isErrorLeaveTypes,
  } = useQuery<LeaveType[]>({
    queryKey: ["leave-types"],
    queryFn: fetchLeaveTypes,
    enabled: !!session?.backendTokens?.accessToken,
    refetchOnMount: true,
  });

  const create = useCreateMutation({
    endpoint: "/api/reserved-days",
    successMessage: "Reserved day saved",
    refetchKey: "reserved-days",
    onSuccess: () => setIsOpen(false),
    onError: setError,
  });

  const onSubmit = (data: ReservedDayForm) => {
    create(data, setError, form.reset);
  };

  if (status === "loading" || isLoadingLeaveTypes) {
    return <Loading />;
  }

  if (isErrorLeaveTypes) {
    return (
      <div>
        <p>Error</p>
      </div>
    );
  }

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
          <Button onClick={() => setIsOpen(true)}>
            <FaPlus /> Add Reserved Day
          </Button>
        )
      }
      title={isEditing ? "Edit Reserved Day" : "Add Reserved Day"}
      footer={
        <div className="flex justify-end gap-2 mt-6">
          {error && <FormError message={error} />}
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="reserved-day-form">
            {isEditing ? "Update" : "Save"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="reserved-day-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 mt-10"
        >
          {/* Employee Field */}
          <EmployeeSingleSelect
            name="employeeId"
            label="Employee"
            placeholder="Select Employee"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="startDate"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
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
              name="endDate"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
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
          </div>
          <FormField
            name="leaveTypeId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel required>Leave Type</FormLabel>
                </div>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Leave Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leaveTypes?.map((lt) => (
                      <SelectItem key={lt.id} value={lt.id}>
                        {lt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Input {...field} placeholder="e.g. Team retreat" />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </GenericSheet>
  );
}
