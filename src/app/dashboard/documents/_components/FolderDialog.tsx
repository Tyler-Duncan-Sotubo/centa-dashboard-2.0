"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Loading from "@/components/ui/loading";
import { FormMultiSelect } from "@/components/ui/form-multi-select";
import FormError from "@/components/ui/form-error";

import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";

import { z } from "zod";
import { useEffect, useState } from "react";
import { FaFolderPlus } from "react-icons/fa6";

const folderSchema = z.object({
  name: z.string().max(255),
  permissionControlled: z.boolean().optional(),
  roleIds: z.array(z.string().uuid()).optional(),
  departmentIds: z.array(z.string().uuid()).optional(),
  officeIds: z.array(z.string().uuid()).optional(),
});

type FolderFormData = z.infer<typeof folderSchema>;

interface FolderDialogProps {
  mode: "create" | "edit";
  folder?: Partial<FolderFormData> & { id: string };
  trigger?: React.ReactNode;
}

export function FolderDialog({ mode, folder, trigger }: FolderDialogProps) {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FolderFormData>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      name: "",
      permissionControlled: false,
      roleIds: [],
      departmentIds: [],
      officeIds: [],
    },
  });

  useEffect(() => {
    if (folder) {
      form.reset({
        name: folder.name || "",
        permissionControlled: folder.permissionControlled || false,
        roleIds: folder.roleIds || [],
        departmentIds: folder.departmentIds || [],
        officeIds: folder.officeIds || [],
      });
    }
  }, [folder, form]);

  const createFolder = useCreateMutation({
    endpoint: "/api/documents/folders",
    successMessage: "Folder created successfully",
    refetchKey: "folders",
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  const updateFolder = useUpdateMutation({
    endpoint: `/api/documents/folders/${folder?.id}`,
    successMessage: "Folder updated successfully",
    refetchKey: "folders",
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

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
    enabled: !!session?.backendTokens.accessToken,
  });

  const onSubmit = async (data: FolderFormData) => {
    try {
      if (mode === "create") {
        await createFolder(data, setError, form.reset);
      } else if (mode === "edit" && folder?.id) {
        await updateFolder(data, setError, form.reset);
      }
    } catch (err) {
      console.error("Folder submission error:", err);
    }
  };

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  const showPermissions = form.watch("permissionControlled");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <FaFolderPlus className="mr-2" />
            Create Folder
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Folder" : "Create Folder"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Payroll Reports" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissionControlled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Restrict folder access
                    </FormLabel>
                    <FormDescription>
                      Limit visibility by roles, departments, or offices.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(val) => field.onChange(Boolean(val))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {showPermissions && (
              <>
                <FormMultiSelect
                  name="roleIds"
                  label="Roles"
                  options={
                    data.roles?.map((r: { id: string; name: string }) => ({
                      label: r.name,
                      value: r.id,
                    })) || []
                  }
                />
                <FormMultiSelect
                  name="departmentIds"
                  label="Departments"
                  options={
                    data.departments?.map(
                      (d: { id: string; name: string }) => ({
                        label: d.name,
                        value: d.id,
                      })
                    ) || []
                  }
                />
                <FormMultiSelect
                  name="officeIds"
                  label="Offices"
                  options={
                    data.locations?.map((o: { id: string; name: string }) => ({
                      label: o.name,
                      value: o.id,
                    })) || []
                  }
                />
              </>
            )}

            {error && <FormError message={error} />}

            <DialogFooter>
              <Button type="submit" isLoading={form.formState.isSubmitting}>
                {mode === "edit" ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
