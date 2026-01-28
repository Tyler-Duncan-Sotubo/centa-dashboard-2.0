"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { useDeleteMutation } from "@/shared/hooks/useDeleteMutation";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";

type Props = {
  id1: string;
  id2: string;
  buildEndpoint: (id1: string, id2: string) => string;
  successMessage: string;
  refetchKey: string;
  confirmText?: string;
  title?: string;
  description?: string;
};

export function DeleteWithTwoIdsDialog({
  id1,
  id2,
  buildEndpoint,
  successMessage,
  refetchKey,
  confirmText = "Delete",
  title = "Are you sure?",
  description = "This action cannot be undone.",
}: Props) {
  const [open, setOpen] = useState(false);

  const deleteMutation = useDeleteMutation({
    endpoint: buildEndpoint(id1, id2),
    successMessage,
    refetchKey,
  });

  const handleDelete = async () => {
    await deleteMutation();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="link" size="icon" className="text-monzo-error">
          <FaTrash />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete}>
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
