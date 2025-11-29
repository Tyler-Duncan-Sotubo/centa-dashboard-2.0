// AssignModal.tsx
"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"; // adjust to your setup
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import { Employee } from "@/types/employees.type";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const assignSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
});

export default function AssignAssignModal({ id }: { id: string }) {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      employeeId: "",
    },
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
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const update = useUpdateMutation({
    endpoint: `/api/assets/${id}`,
    successMessage: "Asset updated",
    refetchKey: "assets",
    onSuccess: () => {
      form.reset();
    },
  });

  if (isLoading) return <Loading />;
  if (isError) return <div>Error fetching employees</div>;

  const activeEmployees = employees?.filter(
    (emp) => emp.employmentStatus === "active"
  );

  const filteredEmployees = activeEmployees?.filter((emp) =>
    `${emp.firstName} ${emp.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  interface AssignFormValues {
    employeeId: string;
  }

  const onSubmit = async (data: AssignFormValues): Promise<void> => {
    await update(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 underline">
          <span className="text-sm text-monzo-brand">+ Assign</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign Asset</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="asset-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <FormField
              name="employeeId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Assigned To Employee
                    <span className="text-xs text-gray-500 ml-2">
                      (Search by name)
                    </span>
                  </FormLabel>
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
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="submit"
            isLoading={form.formState.isSubmitting}
            form="asset-form"
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
