"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import Loading from "@/shared/ui/loading";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import {
  assignAssetSchema,
  type AssignAssetSchema,
} from "../schema/assign-asset.schema";
import { useEmployeesQuery } from "../hooks/use-employees-query";
import { useEmployeeSearch } from "../hooks/use-employee-search";
import { useAssignAssetMutation } from "../hooks/use-assign-asset-mutation";

export function AssignAssetModal({ assetId }: { assetId: string }) {
  const form = useForm<AssignAssetSchema>({
    resolver: zodResolver(assignAssetSchema),
    defaultValues: { employeeId: "" },
  });

  const { data: employees, isLoading, isError } = useEmployeesQuery();
  const { searchTerm, setSearchTerm, filteredEmployees } =
    useEmployeeSearch(employees);

  const { assign } = useAssignAssetMutation(assetId, () => {
    form.reset();
    setSearchTerm("");
  });

  if (isLoading) return <Loading />;
  if (isError) return <div>Error fetching employees</div>;

  const onSubmit = async (payload: AssignAssetSchema) => {
    await assign(payload);
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
            id="assign-asset-form"
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
                    {filteredEmployees.length ? (
                      filteredEmployees.map((emp) => (
                        <div
                          key={emp.id}
                          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                            field.value === emp.id
                              ? "bg-gray-100 font-semibold"
                              : ""
                          }`}
                          onClick={() => {
                            form.setValue("employeeId", emp.id, {
                              shouldValidate: true,
                            });
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
            form="assign-asset-form"
            isLoading={form.formState.isSubmitting}
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
