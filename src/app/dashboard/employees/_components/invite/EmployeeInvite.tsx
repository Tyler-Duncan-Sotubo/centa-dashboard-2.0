"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/shared/ui/form";
import { employeeProfileUpdateSchema } from "@/schema/employee";
import FormError from "@/shared/ui/form-error";
import { useEffect, useState } from "react";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { z } from "zod";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import BasicInformation from "./BasicInformation";
import { WorkInformation } from "./WorkInformation";
import { PersonalInformation } from "./PersonalInformation";
import FinancialInformation from "./FinancialInformation";
import DependentsForm from "./DependentsForm";
import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";
import PageHeader from "@/shared/ui/page-header";
import { EmployeeALL } from "@/types/employees.type";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

// Modified to support both create and edit
type EmployeeModalProps = {
  employee?: EmployeeALL;
};

export type FormType = UseFormReturn<
  z.infer<typeof employeeProfileUpdateSchema>
>;

export const EmployeeModal = ({ employee }: EmployeeModalProps) => {
  const [error, setError] = useState("");
  const axiosInstance = useAxiosAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { data: session, status } = useSession();
  const form = useForm<z.infer<typeof employeeProfileUpdateSchema>>({
    resolver: zodResolver(employeeProfileUpdateSchema),
    defaultValues: {
      firstName: employee?.core.firstName ?? "",
      lastName: employee?.core.lastName ?? "",
      email: employee?.core.email ?? "",
      employeeNumber: employee?.core.employeeNumber ?? "",
      departmentId: employee?.core.departmentId ?? "",
      jobRoleId: employee?.core.jobRoleId ?? "",
      payGroupId: employee?.core.payGroupId ?? "",
      locationId: employee?.core.locationId ?? "",
      employmentStartDate: employee?.core.employmentStartDate ?? "", // Default empty string or date format
      employmentEndDate: employee?.core.employmentEndDate ?? "",
      confirmed: employee?.core.confirmed ?? false,
      probationEndDate: employee?.core.probationEndDate ?? "",
      grossSalary: employee?.compensation.grossSalary ?? 0,
      bankName: employee?.finance.bankName ?? "",
      bankAccountNumber: employee?.finance.bankAccountNumber ?? "",
      bankAccountName: employee?.finance.bankAccountName ?? "",
      currency: employee?.finance.currency ?? "",
      tin: employee?.finance.tin ?? "",
      pensionPin: employee?.finance.pensionPin ?? "",
      nhfNumber: employee?.finance.nhfNumber ?? "",
    },
  });

  useEffect(() => {
    if (employee) {
      setIsEditing(true);
    }
  }, [employee]);

  const router = useRouter();

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

  const createEmployee = useCreateMutation({
    endpoint: "/api/employees/multi",
    successMessage: "Employee Added",
    refetchKey: "employees onboarding",
    onSuccess: () => {
      form.reset();
      router.push("/dashboard/employees");
    },
  });

  const updateEmployee = useCreateMutation({
    endpoint: `/api/employees/multi/${employee?.core.id}`, // PUT or PATCH request to update
    successMessage: "Employee Updated",
    refetchKey: "employees",
    onSuccess: () => {
      form.reset();
      router.push("/dashboard/employees");
    },
  });

  const onSubmit = async (
    values: z.infer<typeof employeeProfileUpdateSchema>,
  ) => {
    setError(""); // Reset error before submitting
    if (employee) {
      await updateEmployee(values, setError, form.reset); // Update existing employee
    } else {
      await createEmployee(values, setError, form.reset); // Create new employee
    }
  };

  // While either the session or employee data is loading, show loading state
  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <div className="px-5">
      <PageHeader
        title={employee ? "Edit Employee" : "Invite Employees"}
        description={
          employee
            ? "Edit the employee details below."
            : "Fill in the details below to invite employees to the system."
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 my-6">
          <BasicInformation form={form} isEditing={isEditing} />
          <WorkInformation
            form={form}
            departments={data.departments}
            groups={data.payGroups}
            jobRoles={data.jobRoles}
            locations={data.locations}
            costCenters={data.costCenters}
          />
          <PersonalInformation form={form} />
          <FinancialInformation form={form} />
          <DependentsForm form={form} />
        </form>
        {error ? <FormError message={error} /> : ""}

        <div className="flex items-center justify-end mt-6">
          <Button
            onClick={form.handleSubmit(onSubmit)}
            isLoading={form.formState.isSubmitting}
          >
            {employee ? "Update" : "Submit"}
          </Button>
        </div>
      </Form>
    </div>
  );
};
