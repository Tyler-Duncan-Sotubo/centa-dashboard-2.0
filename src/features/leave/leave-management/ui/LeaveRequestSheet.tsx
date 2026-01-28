"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import GenericSheet from "@/shared/ui/generic-sheet";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/shared/ui/form";
import FormError from "@/shared/ui/form-error";
import { Textarea } from "@/shared/ui/textarea";
import Loading from "@/shared/ui/loading";
import { LeaveRequestForm, leaveRequestSchema } from "../schema/schema";
import { useEmployees } from "../hooks/use-employees";
import { useLeaveTypes } from "../hooks/use-leave-types";
import { useCreateLeaveRequest } from "../hooks/use-create-leave-request";

export const LeaveRequestSheet = () => {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<LeaveRequestForm>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      employeeId: "",
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
      partialDay: undefined,
    },
  });

  const employees = useEmployees(searchTerm, isSheetOpen); // only fetch when sheet is open
  const leaveTypes = useLeaveTypes(isSheetOpen);

  const createLeaveRequest = useCreateLeaveRequest(
    () => {
      form.reset();
      setSheetOpen(false);
      setError(null);
      setSearchTerm("");
    },
    (m) => setError(m),
  );

  const onSubmit = async (values: LeaveRequestForm) => {
    await createLeaveRequest(values, setError, form.reset);
  };

  const loading = employees.isLoading || leaveTypes.isLoading;
  const fetchError = employees.isError || leaveTypes.isError;

  if (loading) return <Loading />;
  if (fetchError) return <div>Error fetching employees</div>;

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
                  {employees.filteredEmployees?.length ? (
                    employees.filteredEmployees.map((emp) => (
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
                    {(leaveTypes.data ?? []).map((lt) => (
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="startDate"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
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
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                    placeholder=""
                  />
                </FormControl>
                <FormMessage />
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
