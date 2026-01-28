/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { FaUserCheck } from "react-icons/fa6";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { CostCenterModal } from "@/app/dashboard/payroll/settings/cost-centers/_components/CostCenterModal";
import { DateInput } from "@/shared/ui/date-input";
import DepartmentModal from "@/features/company/departments/ui/DepartmentModal";
import JobRoleModal from "@/features/company/job-roles/ui/JobRoleModal";

export const employeeProfile = z.object({
  employeeNumber: z.string().min(1),
  departmentId: z.string().min(1),
  locationId: z.string(),
  payGroupId: z.string().min(1),
  jobRoleId: z.string().min(1),
  costCenterId: z.string().min(1),
  companyRoleId: z.string().min(1),
  onboardingTemplateId: z.string().min(1),
  offerLetterTemplateId: z.string().optional(),
  employmentStatus: z.enum([
    "probation",
    "active",
    "on_leave",
    "resigned",
    "terminated",
    "onboarding",
  ]),
  employmentStartDate: z.string(),
  employmentEndDate: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  grossSalary: z.string().min(1, "Gross salary is required"),
});

export type FormType = UseFormReturn<z.infer<typeof employeeProfile>>;

export const SendOnboardingInviteSheet = () => {
  const axiosInstance = useAxiosAuth();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const [isJobRoleOpen, setIsJobRoleOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isPayGroupOpen, setIsPayGroupOpen] = useState(false);
  const [isCostCenterOpen, setIsCostCenterOpen] = useState(false);

  const form = useForm<z.infer<typeof employeeProfile>>({
    resolver: zodResolver(employeeProfile),
    defaultValues: {},
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
    enabled: !!session?.backendTokens?.accessToken,
  });

  const createEmployeeId = useCreateMutation({
    endpoint: "/api/employees/generate-id",
    successMessage: "Employee ID generated",
  });

  const createEmployee = useCreateMutation({
    endpoint: "/api/employees",
    successMessage: "Employee Invite Sent",
    refetchKey: "onboarding-employees onboarding",
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });

  const onSubmit = async (values: z.infer<typeof employeeProfile>) => {
    await createEmployee(values, setError);
  };

  // While either the session or employee data is loading, show loading state
  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  const HandleAddExtra = ({ label }: { label: string }) => {
    return (
      <div className="flex items-center justify-between my-0">
        <FormLabel required className="my-0 text-xs">
          {label}
        </FormLabel>
        <Button
          variant={"link"}
          className="p-0 m-0 h-6 text-xs"
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
            } else if (label === "Cost Center") {
              setIsCostCenterOpen(true);
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
        <Button onClick={() => setOpen(true)}>
          <FaUserCheck size={16} />
          Send Invite
        </Button>
      }
      title="Send Onboarding Invite"
      footer={
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="entity-form">
            Start Onboarding
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="entity-form"
          className="space-y-4 mt-2 mb-5"
        >
          <FormField
            name="onboardingTemplateId"
            control={form.control}
            defaultValue={form.getValues("onboardingTemplateId") || ""} // Ensure default value
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Onboarding Template</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.templates?.map(
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

          <section>
            <h2 className="text-lg font-bold my-1">Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                name="employeeNumber"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
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
                              error,
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
                  <FormItem className="mt-3.5">
                    <FormLabel required>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="lastName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
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
                  <FormItem>
                    <FormLabel required>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>
          <section>
            <h2 className="text-lg font-bold my-2">Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                name="companyRoleId"
                control={form.control}
                defaultValue={form.getValues("companyRoleId") || ""} // Ensure default value
                render={({ field }) => (
                  <FormItem className="mt-2">
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.roles
                          ?.filter((role: { name: string }) => {
                            return (
                              role.name !== "super_admin" &&
                              role.name !== "admin"
                            );
                          })
                          .map(
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
                    <HandleAddExtra label="Cost Center" />
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Cost Center" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.costCenters?.map(
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
                defaultValue={"onboarding"} // Ensure default value
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Employment Status</FormLabel>
                    <FormControl>
                      <Input {...field} value={"Onboarding"} disabled />
                    </FormControl>
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
                      <DateInput
                        {...field}
                        onChange={(date) => field.onChange(date)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h2 className="text-lg font-bold my-3">Compensation</h2>
              <FormField
                name="grossSalary"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Gross Salary (in Naira)
                      <span className="text-xs text-muted-foreground">
                        (e.g. 500000.00)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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

            <CostCenterModal
              isOpen={isCostCenterOpen}
              onClose={() => setIsCostCenterOpen(false)}
            />
          </section>
        </form>
        {error ? <FormError message={error} /> : ""}
      </Form>
    </GenericSheet>
  );
};
