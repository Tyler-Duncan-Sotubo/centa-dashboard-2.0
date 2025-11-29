import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { Button } from "@/components/ui/button";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { FormType } from "./EmployeeInvite";

const BasicInformation = ({
  form,
  isEditing,
}: {
  form: FormType;
  isEditing: boolean;
}) => {
  const createEmployeeId = useCreateMutation({
    endpoint: "/api/employees/generate-id",
    successMessage: "Employee ID generated",
    refetchKey: "employees",
  });

  return (
    <section className="shadow-md rounded-md px-6 py-10 bg-white border border-sidebar">
      <h3 className="text-xl font-semibold">Basic Info</h3>
      <div className="grid grid-cols-2 gap-10 mt-4">
        <div>
          <FormField
            name="employeeNumber"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between mb-1">
                  <FormLabel required>Employee ID</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const data = await createEmployeeId();
                        field.onChange(data.data);
                      } catch (error) {
                        console.error(
                          "Failed to generate employee number:",
                          error
                        );
                      }
                    }}
                  >
                    Generate
                  </Button>
                </div>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="firstName"
            control={form.control}
            render={({ field }) => (
              <FormItem className="mt-6">
                <FormLabel required>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            name="lastName"
            control={form.control}
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel required>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem className="mt-6">
                <FormLabel required>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} disabled={isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </section>
  );
};

export default BasicInformation;
