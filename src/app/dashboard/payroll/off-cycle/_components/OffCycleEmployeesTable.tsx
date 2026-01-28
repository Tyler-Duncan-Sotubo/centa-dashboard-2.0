"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { OffCycleType } from "./PayrollOffCyclePicker";
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
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Trash2 } from "lucide-react";
import { useDeleteMutation } from "@/shared/hooks/useDeleteMutation";
import { useEffect } from "react";

export function OffCyclePayrollTable({
  data,
  setOffCycleEmployees,
}: {
  data: OffCycleType[];
  setOffCycleEmployees: React.Dispatch<React.SetStateAction<OffCycleType[]>>;
}) {
  useEffect(() => {
    const stored = localStorage.getItem("offCycleEmployees");
    if (stored) {
      try {
        setOffCycleEmployees(JSON.parse(stored));
      } catch {
        setOffCycleEmployees([]);
      }
    }
  }, [setOffCycleEmployees]);

  function DeleteOffCycleAlert({
    id,
    setOffCycleEmployees,
  }: {
    id: string;
    setOffCycleEmployees: React.Dispatch<React.SetStateAction<OffCycleType[]>>;
  }) {
    const deleteOffCycle = useDeleteMutation({
      endpoint: `/api/off-cycle/${id}`,
      successMessage: "Off cycle deleted successfully",
      refetchKey: "off-cycle",
      onSuccess: () => {
        const stored = localStorage.getItem("offCycleEmployees");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const updated = parsed.filter(
              (entry: { id: string }) => entry.id !== id,
            );
            if (updated.length > 0) {
              localStorage.setItem(
                "offCycleEmployees",
                JSON.stringify(updated),
              );
            } else {
              localStorage.removeItem("offCycleEmployees");
            }
            setOffCycleEmployees(updated);
          } catch {
            localStorage.removeItem("offCycleEmployees");
            setOffCycleEmployees([]);
          }
        }
      },
    });

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Trash2 size={16} color="red" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteOffCycle()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <div className="rounded-lg border shadow-2xs mt-6">
      <Table>
        <TableHeader className="bg-sidebar text-md">
          <TableRow>
            <TableHead>Employee Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount (₦)</TableHead>
            <TableHead>Taxable</TableHead>
            <TableHead>Proratable</TableHead>
            <TableHead>Payroll Date</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id} className="text-md capitalize">
              <TableCell className="py-5">{item.name}</TableCell>
              <TableCell>{item.type.replace(/_/g, " ")}</TableCell>
              <TableCell>
                ₦
                {Number(item.amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell>{item.taxable ? "Yes" : "No"}</TableCell>
              <TableCell>{item.proratable ? "Yes" : "No"}</TableCell>
              <TableCell>
                {new Date(item.payrollDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{item.notes || "-"}</TableCell>
              <TableCell className="text-center">
                {" "}
                <DeleteOffCycleAlert
                  id={item.id}
                  setOffCycleEmployees={setOffCycleEmployees}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
