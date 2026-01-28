"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { EmployeeDeduction } from "@/types/deduction.type";
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
import { useState } from "react";
import { Trash } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useDeleteMutation } from "@/shared/hooks/useDeleteMutation";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import DeductionModal from "./_components/DeductionModal";
import PageHeader from "@/shared/ui/page-header";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const DeductionSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchCustomDeductions = async () => {
    try {
      const res = await axiosInstance.get(
        "/api/deductions/company/employee-deductions",
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: customDeductions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["employeeDeductions"],
    queryFn: fetchCustomDeductions,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  const Alert = ({
    icon,
    type,
    id,
  }: {
    icon: React.ReactNode;
    type: string;
    id: string;
  }) => {
    const deleteDeduction = useDeleteMutation({
      endpoint: `/api/deductions/employee-deductions/${id}`,
      successMessage: "Deduction Removed",
      refetchKey: "employeeDeductions",
    });

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost">{icon}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {type === "edit" ? "Edit Deduction" : "Delete Deduction"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {type} this deduction?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="w-1/4 text-white bg-red-600 hover:bg-red-600"
              onClick={() => deleteDeduction()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };
  if (status === "loading" || isLoading) return <Loading />;
  if (isError)
    return <div className="text-red-500">Failed to load bonuses</div>;

  return (
    <section>
      <PageHeader
        title="Payroll Deductions"
        description="Manage your payroll deductions here."
      >
        <Button className="ml-auto" onClick={() => setIsOpen(true)}>
          Add Deduction
        </Button>
      </PageHeader>

      <div>
        {/* ✅ Table always visible */}
        <div className="py-6 my-2 space-y-4">
          <Table className="text-md">
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Deduction Name</TableHead>
                <TableHead>Rate Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customDeductions?.length > 0 ? (
                customDeductions.map((deduction: EmployeeDeduction) => (
                  <TableRow key={deduction.id}>
                    <TableCell>{deduction.employeeName}</TableCell>
                    <TableCell className="py-4">
                      {deduction.deductionTypeName}
                    </TableCell>
                    <TableCell className="py-4">{deduction.rateType}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(Number(deduction.rateValue))}
                    </TableCell>
                    <TableCell className="py-4">
                      {new Date(deduction.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Alert
                        icon={<Trash className="text-red-500" />}
                        type="deduction"
                        id={deduction.id}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                /* Show empty state row */
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 italic text-center text-gray-500"
                  >
                    No deductions added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <DeductionModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </section>
  );
};

export default DeductionSettings;
