"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import FormError from "@/shared/ui/form-error";
import { Employee } from "@/types/employees.type";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

export const overRideSchema = z.object({
  notes: z.string().min(1, "Note is required"),
  employeeId: z.string().min(1, "Employee is required"),
});

export const EmployeeOverride = ({
  payrollDate,
  inactiveEmployees,
  setSheetOpen,
}: {
  payrollDate: string;
  inactiveEmployees: Employee[] | undefined;
  setSheetOpen: (open: boolean) => void;
}) => {
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<z.infer<typeof overRideSchema>>({
    resolver: zodResolver(overRideSchema),
  });

  const crateOverride = useCreateMutation({
    endpoint: "/api/payroll-overrides",
    successMessage: "Override created successfully",
    refetchKey: "payroll pay-date",
    onSuccess: () => {
      setError(null);
      setSheetOpen(false);
    },
  });

  const onSubmit = async (values: z.infer<typeof overRideSchema>) => {
    try {
      await crateOverride(
        {
          employeeId: values.employeeId,
          payrollDate,
          forceInclude: true,
          notes: values.notes,
        },
        setError,
        () => {},
      );
    } catch (err) {
      console.error(err);
      setError("Failed to submit. Please try again.");
    }
  };

  const filteredEmployees = inactiveEmployees?.filter((emp) =>
    `${emp.firstName} ${emp.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  return (
    <Form {...form}>
      <form
        id="employee-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 my-6"
      >
        <h2 className="text-lg font-semibold">
          Current Payroll Date: {payrollDate}
        </h2>

        {/* Employee Selection */}
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
                  filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        field.value === employee.id
                          ? "bg-gray-100 font-semibold"
                          : ""
                      }`}
                      onClick={() => {
                        form.setValue("employeeId", employee.id);
                        setSearchTerm(
                          `${employee.firstName} ${employee.lastName}`,
                        );
                      }}
                    >
                      {employee.firstName} {employee.lastName}
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

        {/* Notes */}
        <FormField
          name="notes"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Reason or label for this adjustment"
                  className="h-28 resize-none"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          form="employee-form"
          className="bg-brand text-white"
        >
          Submit
        </Button>
        <div className="mt-6 flex text-left">
          {error && <FormError message={error} />}
        </div>
      </form>
    </Form>
  );
};

export default EmployeeOverride;
