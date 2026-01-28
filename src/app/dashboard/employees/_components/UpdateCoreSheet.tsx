/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import GenericSheet from "@/shared/ui/generic-sheet";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import FormError from "@/shared/ui/form-error";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { FaEdit } from "react-icons/fa";
import { LocationModal } from "@/features/company/offices/ui/LocationModal";
import { PayGroupModal } from "@/features/payroll/settings/pay-group/ui/PayGroupModal";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import DepartmentModal from "@/features/company/departments/ui/DepartmentModal";
import JobRoleModal from "@/features/company/job-roles/ui/JobRoleModal";

export const employeeProfile = z.object({
  employeeNumber: z.string().min(1),
  departmentId: z.string().min(1),
  locationId: z.string(),
  payGroupId: z.string().min(1),
  jobRoleId: z.string().min(1),
  costCenterId: z.string().min(1).nullable(),
  companyRoleId: z.string().min(1),
  employmentStatus: z.enum([
    "probation",
    "active",
    "on_leave",
    "resigned",
    "terminated",
  ]),
  employmentStartDate: z.string(),
  employmentEndDate: z.string().optional(),
  confirmed: z.coerce.boolean(),
});

type EmployeeModalProps = {
  employee: any;
  employeeId: string; // Optional employeeId for updates
};

export type FormType = UseFormReturn<z.infer<typeof employeeProfile>>;

export const UpdateCoreSheet = ({
  employee,
  employeeId,
}: EmployeeModalProps) => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const [isJobRoleOpen, setIsJobRoleOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isPayGroupOpen, setIsPayGroupOpen] = useState(false);

  const form = useForm<z.infer<typeof employeeProfile>>({
    resolver: zodResolver(employeeProfile),
    defaultValues: {
      costCenterId: "",
    },
  });

  // Fetch company elements, this part stays the same
  const fetchCompanyElements = async () => {
    try {
      const res = await axiosInstance.get("/api/company/company-elements");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["company-elements"],
    queryFn: fetchCompanyElements,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  const updateEmployee = useUpdateMutation({
    endpoint: `/api/employees/${employeeId}`, // PUT or PATCH request to update
    successMessage: "Employee Updated",
    refetchKey: "employee employees",
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });

  const onSubmit = async (values: z.infer<typeof employeeProfile>) => {
    await updateEmployee(values, setError, form.reset); // Update existing employee
  };

  // Reset form values when employee data changes
  useEffect(() => {
    if (employee) {
      form.reset(employee);
    }
  }, [employee, form]);

  // While either the session or employee data is loading, show loading state
  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  const HandleAddExtra = ({ label }: { label: string }) => {
    return (
      <div className="flex items-center justify-between my-0">
        <FormLabel required className="my-0">
          {label}
        </FormLabel>
        <Button
          variant={"link"}
          className="p-0 m-0 h-6"
          type="button"
          onClick={() => {
            if (label === "Job Role") {
              setIsJobRoleOpen(true);
            } else if (label === "Department") {
              setIsDepartmentOpen(true);
            } else if (label === "Pay Group") {
              setIsPayGroupOpen(true);
            } else if (label === "Location") {
              setIsLocationOpen(true);
            }
          }}
        >
          Add New
        </Button>
      </div>
    );
  };

  return (
    <GenericSheet
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <FaEdit className="h-4 w-4" />
        </Button>
      }
      title="Update Employee"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="entity-form">
            Update
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="entity-form"
          className="space-y-4 mt-10 mb-5"
        >
          <section>
            <h3 className="text-xl font-semibold">Work</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                name="departmentId"
                control={form.control}
                defaultValue={form.getValues("departmentId") || ""} // Ensure default value
                render={({ field }) => (
                  <FormItem>
                    <HandleAddExtra label="Department" />
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.departments?.map(
                          (
                            department: {
                              id: string;
                              name: string;
                            },
                            index: number,
                          ) => (
                            <SelectItem key={index} value={department.id}>
                              {department.name}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="jobRoleId"
                control={form.control}
                defaultValue={form.getValues("jobRoleId") || ""} // Ensure default value
                render={({ field }) => (
                  <FormItem>
                    <HandleAddExtra label="Job Role" />
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Job Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.jobRoles?.map(
                          (
                            role: {
                              id: string;
                              title: string;
                            },
                            index: number,
                          ) => (
                            <SelectItem key={index} value={role.id}>
                              {role.title}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="costCenterId"
                control={form.control}
                defaultValue={form.getValues("costCenterId") || ""} // Ensure default value
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Cost Center</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Cost Center" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.costCenters?.map(
                          (
                            group: {
                              id: string;
                              name: string | null;
                            },
                            index: number,
                          ) => (
                            <SelectItem key={index} value={group.id}>
                              {group.name ?? ""}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="payGroupId"
                control={form.control}
                defaultValue={form.getValues("payGroupId") || ""} // Ensure default value
                render={({ field }) => (
                  <FormItem>
                    <HandleAddExtra label="Pay Group" />
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Pay Group" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.payGroups?.map(
                          (
                            group: {
                              id: string;
                              name: string;
                            },
                            index: number,
                          ) => (
                            <SelectItem key={index} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="locationId"
                control={form.control}
                defaultValue={form.getValues("locationId") || ""} // Ensure default value
                render={({ field }) => (
                  <FormItem>
                    <HandleAddExtra label="Location" />
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.locations?.map(
                          (
                            role: {
                              id: string;
                              name: string;
                            },
                            index: number,
                          ) => (
                            <SelectItem key={index} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* This is the second column */}
              <FormField
                name="employmentStatus"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="probation">Probation</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="resigned">Resigned</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="employmentStartDate"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Start Date</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="confirmed"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Is Confirmed</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val === "true")}
                      value={String(field.value)} // ensure it's consistent
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="companyRoleId"
                control={form.control}
                defaultValue={form.getValues("companyRoleId") || ""} // Ensure default value
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.roles.map(
                          (role: {
                            id: string;
                            name: string;
                            value: string;
                          }) => (
                            <SelectItem key={role.value} value={role.id}>
                              {role.name
                                .split("_")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1),
                                )
                                .join(" ")}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <JobRoleModal
              isOpen={isJobRoleOpen}
              onClose={() => setIsJobRoleOpen(false)}
            />
            <DepartmentModal
              isOpen={isDepartmentOpen}
              onClose={() => setIsDepartmentOpen(false)}
            />

            <PayGroupModal
              isOpen={isPayGroupOpen}
              onClose={() => setIsPayGroupOpen(false)}
            />

            <LocationModal
              isOpen={isLocationOpen}
              onClose={() => setIsLocationOpen(false)}
            />
          </section>
        </form>
        {error ? <FormError message={error} /> : ""}
      </Form>
    </GenericSheet>
  );
};
