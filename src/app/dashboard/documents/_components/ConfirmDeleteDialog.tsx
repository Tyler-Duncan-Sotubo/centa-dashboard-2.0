"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FaTrash } from "react-icons/fa6";
import { useState } from "react";
import { useDeleteMutation } from "@/hooks/useDeleteMutation";

interface ConfirmDeleteDialogProps {
  id: string;
  type: "folder" | "file";
}

export function ConfirmDeleteDialog({ id, type }: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const deleteAny = useDeleteMutation({
    endpoint: `/api/documents/${type === "folder" ? "folders" : "files"}/${id}`,
    successMessage: `${
      type.charAt(0).toUpperCase() + type.slice(1)
    } deleted successfully.`,
    refetchKey: "folders",
  });

  const handleDelete = async () => {
    await deleteAny();
    setOpen(false);
  };

  const label = type === "folder" ? "folder" : "file";

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <FaTrash
          size={16}
          className="hover:text-destructive cursor-pointer text-monzo-error"
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.{" "}
            {type === "folder"
              ? "Make sure the folder is empty before deleting."
              : "The file will be permanently removed."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
