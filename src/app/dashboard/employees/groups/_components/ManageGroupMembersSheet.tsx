"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Checkbox } from "@/shared/ui/checkbox";
import { Button } from "@/shared/ui/button";
import GenericSheet from "@/shared/ui/generic-sheet";
import FormError from "@/shared/ui/form-error";
import Loading from "@/shared/ui/loading";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Employee } from "@/types/employees.type";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { Users } from "lucide-react";

interface Props {
  groupId: string;
  groupName: string;
}

export default function ManageGroupMembersSheet({ groupId, groupName }: Props) {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<{ employeeIds: string[] }>({
    defaultValues: { employeeIds: [] },
  });

  const {
    data: employees,
    isLoading: loadingEmployees,
    isError: errorEmployees,
  } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/employees/all/summary");
      return res.data.data;
    },
    enabled: Boolean(session?.backendTokens?.accessToken) && open,
  });

  // Prefill selected employees in the group
  useEffect(() => {
    if (open && employees) {
      const preselected = employees
        .filter((emp) => emp.groupId === groupId)
        .map((emp) => emp.id);

      form.reset({ employeeIds: preselected });
    }
  }, [open, employees, groupId, form]);

  const updateGroup = useUpdateMutation({
    endpoint: `/api/employee-groups/${groupId}/members`,
    successMessage: "Group members updated",
    refetchKey: "employee-groups",
    onSuccess: () => setOpen(false),
  });

  const onSubmit = async (values: { employeeIds: string[] }) => {
    await updateGroup(values, setError);
  };

  if (status === "loading" || loadingEmployees) return <Loading />;
  if (errorEmployees) return <p>Error loading employees</p>;

  return (
    <GenericSheet
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="link" onClick={() => setOpen(true)}>
          <Users className="h-4 w-4" />
        </Button>
      }
      title={`Manage Members - ${groupName}`}
      description="Add or remove employees from this group"
      position="right"
      footer={
        <Button
          form="group-members-form"
          type="submit"
          disabled={form.formState.isSubmitting}
          isLoading={form.formState.isSubmitting}
        >
          Save Changes
        </Button>
      }
    >
      <Form {...form}>
        <form
          id="group-members-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 py-4"
        >
          <FormField
            name="employeeIds"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Members</FormLabel>
                <div className="space-y-2 max-h-[300px] overflow-auto border p-3 rounded-md">
                  {employees?.map((emp) => (
                    <div key={emp.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={
                          Array.isArray(field.value) &&
                          field.value.includes(emp.id)
                        }
                        onCheckedChange={(checked) => {
                          const current = Array.isArray(field.value)
                            ? field.value
                            : [];
                          const updated = checked
                            ? [...current, emp.id]
                            : current.filter((id) => id !== emp.id);

                          field.onChange(updated);
                        }}
                      />
                      <span>
                        {emp.firstName} {emp.lastName}
                      </span>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <FormError message={error} />}
        </form>
      </Form>
    </GenericSheet>
  );
}
