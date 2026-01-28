"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import Loading from "@/shared/ui/loading";
import { FormMultiSelect } from "@/shared/ui/form-multi-select";
import FormError from "@/shared/ui/form-error";
import { FaFolderPlus } from "react-icons/fa6";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import { useFolderDialogForm } from "../hooks/use-folder-dialog-form";
import { useCompanyElements } from "../hooks/use-company-elements";
import { FolderFormData } from "../schema/create-folder.schema";
import { FolderItem } from "../types/documents.type";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

interface FolderDialogProps {
  mode: "create" | "edit";
  folder?: (Partial<FolderFormData> & { id: string }) | undefined;
  trigger?: React.ReactNode;
  parentId?: string | null; // optional default when opening (create only)
}

type FolderNode = FolderItem & { children?: FolderNode[] };

function flattenFolders(nodes: FolderNode[], out: FolderNode[] = []) {
  for (const n of nodes) {
    out.push(n);
    if (n.children?.length) flattenFolders(n.children, out);
  }
  return out;
}

export function FolderDialog({
  mode,
  folder,
  trigger,
  parentId = null,
}: FolderDialogProps) {
  const { status, data: session } = useSession();
  const axios = useAxiosAuth();
  const [open, setOpen] = useState(false);

  const companyElements = useCompanyElements();
  const { form, error, onSubmit, showPermissions } = useFolderDialogForm({
    mode,
    folder,
    onClose: () => setOpen(false),
  });

  const foldersQuery = useQuery<FolderNode[]>({
    queryKey: ["folders"],
    queryFn: async () => {
      const res = await axios.get("/api/documents/folders");
      return res.data.data ?? [];
    },
    enabled: Boolean(session?.backendTokens?.accessToken) && open,
    staleTime: 0,
  });

  const folderOptions = useMemo(() => {
    const roots = foldersQuery.data ?? [];
    const flat = flattenFolders(roots, []);
    return flat.filter((f) => f.id !== folder?.id);
  }, [foldersQuery.data, folder?.id]);

  // ✅ set default parent once when opening (only if empty)
  useEffect(() => {
    if (!open) return;
    if (mode !== "create") return;

    const current = form.getValues("parentId");
    if ((current === null || current === undefined) && parentId) {
      form.setValue("parentId", parentId, { shouldDirty: true });
    }
  }, [open, mode, parentId, form]);

  if (
    status === "loading" ||
    companyElements.isLoading ||
    (open && foldersQuery.isLoading)
  ) {
    return <Loading />;
  }

  if (companyElements.isError || foldersQuery.isError) {
    return <p>Error loading data</p>;
  }

  const data = companyElements.data ?? {};

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
            {/* Parent folder */}
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Folder</FormLabel>
                  <FormControl>
                    <Select
                      value={(field.value ?? "root") as string}
                      onValueChange={(v) => {
                        const next = v === "root" ? null : v;
                        if (next === field.value) return;
                        field.onChange(next);
                      }}
                      disabled={mode === "edit"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="root">No parent (root)</SelectItem>
                        {folderOptions.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
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

            {/* Permissions toggle */}
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
                  options={(data.roles ?? []).map((r) => ({
                    label: r.name,
                    value: r.id,
                  }))}
                />
                <FormMultiSelect
                  name="departmentIds"
                  label="Departments"
                  options={(data.departments ?? []).map((d) => ({
                    label: d.name,
                    value: d.id,
                  }))}
                />
                <FormMultiSelect
                  name="officeIds"
                  label="Offices"
                  options={(data.locations ?? []).map((o) => ({
                    label: o.name,
                    value: o.id,
                  }))}
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
