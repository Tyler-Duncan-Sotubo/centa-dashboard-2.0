"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import GenericSheet from "@/components/ui/generic-sheet";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import FormError from "@/components/ui/form-error";
import { Textarea } from "@/components/ui/textarea";
import Loading from "@/components/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { Employee } from "@/types/employees.type";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { LeaveType } from "@/types/leave.type";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const leaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, "Leave type is required"),
  employeeId: z.string().min(1, "Employee is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().optional(),
  partialDay: z.enum(["AM", "PM"]).optional(),
});

export const LeaveRequestSheet = () => {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<z.infer<typeof leaveRequestSchema>>({
    resolver: zodResolver(leaveRequestSchema),
  });

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/api/employees");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const {
    data: employees,
    isLoading,
    isError,
  } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    enabled: !!session?.backendTokens.accessToken,
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

  const activeEmployees = employees?.filter(
    (emp) => emp.employmentStatus === "active"
  );

  const createLeaveRequest = useCreateMutation({
    endpoint: "/api/leave-request",
    successMessage: "Leave request created successfully",
    refetchKey: "leave-data",
    onSuccess: () => {
      form.reset();
      setSheetOpen(false);
      setError(null);
    },
    onError: setError,
  });

  const onSubmit = async (values: z.infer<typeof leaveRequestSchema>) => {
    await createLeaveRequest(values, setError, form.reset);
  };

  const filteredEmployees = activeEmployees?.filter((emp) =>
    `${emp.firstName} ${emp.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (isLoading || isLoadingLeaveTypes) return <Loading />;
  if (isError || isErrorLeaveTypes) return <div>Error fetching employees</div>;

  const trigger = (
    <Button onClick={() => setSheetOpen(true)}>Request Leave</Button>
  );

  return (
    <GenericSheet
      trigger={trigger}
      title="New Leave Request"
      description="Submit a new leave request"
      open={isSheetOpen}
      onOpenChange={setSheetOpen}
      position="right"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Employee Field */}
          <FormField
            name="employeeId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee</FormLabel>
                <Input
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="my-4 border rounded bg-white max-h-48 overflow-y-auto">
                  {filteredEmployees?.length ? (
                    filteredEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                          field.value === emp.id
                            ? "bg-gray-100 font-semibold"
                            : ""
                        }`}
                        onClick={() => {
                          form.setValue("employeeId", emp.id);
                          setSearchTerm(`${emp.firstName} ${emp.lastName}`);
                        }}
                      >
                        {emp.firstName} {emp.lastName}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">
                      No matches found
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Leave Type Field */}
          <FormField
            name="leaveTypeId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leave Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes?.map((leaveType) => (
                      <SelectItem key={leaveType.id} value={leaveType.id}>
                        {leaveType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Dates */}
            <FormField
              name="startDate"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Partial Day */}
          <FormField
            name="partialDay"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Partial Day</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AM or PM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reason */}
          <FormField
            name="reason"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason</FormLabel>
                <FormControl>
                  <Textarea
                    className="h-36 resize-none"
                    {...field}
                    placeholder="Optional reason..."
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" className="bg-brand text-white w-full">
            Submit Request
          </Button>
          {error && <FormError message={error} />}
        </form>
      </Form>
    </GenericSheet>
  );
};
