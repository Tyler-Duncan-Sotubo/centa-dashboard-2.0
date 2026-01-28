"use client";

import { Trash } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/shared/ui/alert-dialog";
import { useDeleteOfficeLocation } from "../hooks/use-delete-office-location";

export function DeleteOfficeLocationDialog({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const { deleteOfficeLocation } = useDeleteOfficeLocation(id);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost">
          <Trash className="text-red-500" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Office Location</AlertDialogTitle>
          <AlertDialogDescription>
            {name === "Head Office"
              ? "You cannot delete the Head Office location."
              : `Are you sure you want to delete the office location "${name}"? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="text-white w-1/4 bg-red-600 hover:bg-red-600"
            onClick={() => deleteOfficeLocation()}
            disabled={name === "Head Office"}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
