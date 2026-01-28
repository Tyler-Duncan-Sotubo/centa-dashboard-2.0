"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { FolderFormData, folderSchema } from "../schema/create-folder.schema";

export function useFolderDialogForm(opts: {
  mode: "create" | "edit";
  folder?: Partial<FolderFormData> & { id: string };
  onClose: () => void;
}) {
  const { mode, folder, onClose } = opts;
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FolderFormData>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      name: "",
      parentId: null, // ✅
      permissionControlled: false,
      roleIds: [],
      departmentIds: [],
      officeIds: [],
    },
  });

  useEffect(() => {
    if (!folder) return;
    form.reset({
      name: folder.name || "",
      parentId: folder.parentId ?? null, // ✅ (if provided)
      permissionControlled: folder.permissionControlled || false,
      roleIds: folder.roleIds || [],
      departmentIds: folder.departmentIds || [],
      officeIds: folder.officeIds || [],
    });
  }, [folder, form]);

  const createFolder = useCreateMutation({
    endpoint: "/api/documents/folders",
    successMessage: "Folder created successfully",
    refetchKey: "folders",
    onSuccess: () => {
      onClose();
      form.reset();
    },
  });

  const updateFolder = useUpdateMutation({
    endpoint: `/api/documents/folders/${folder?.id}`,
    successMessage: "Folder updated successfully",
    refetchKey: "folders",
    onSuccess: () => {
      onClose();
      form.reset();
    },
  });

  const setParentId = (parentId: string | null) => {
    form.setValue("parentId", parentId);
  };

  const onSubmit = async (values: FolderFormData) => {
    if (mode === "create") return createFolder(values, setError, form.reset);
    if (mode === "edit" && folder?.id)
      return updateFolder(values, setError, form.reset);
  };

  const showPermissions = form.watch("permissionControlled");

  return { form, error, setError, onSubmit, showPermissions, setParentId };
}
