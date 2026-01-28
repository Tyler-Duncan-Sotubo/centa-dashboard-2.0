"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Trash, PlusCircle } from "lucide-react";
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
import BonusModal from "./_components/BonusModal";
import { Bonus } from "@/types/bonus.type";
import { useDeleteMutation } from "@/shared/hooks/useDeleteMutation";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import PageHeader from "@/shared/ui/page-header";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const BonusSettings = () => {
  const [isBonusOpen, setIsBonusOpen] = useState(false);
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchBonus = async () => {
    try {
      const res = await axiosInstance.get("/api/bonuses");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: bonus,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["bonus"],
    queryFn: fetchBonus,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  function formatPayrollMonth(payrollMonth: string): string {
    if (!payrollMonth) return "";
    const [year, month] = payrollMonth?.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1); // Month is 0-based in JS
    return `${date.toLocaleString("en-US", { month: "long" })} ${year}`;
  }

  const Alert = ({
    icon,
    type,
    id,
  }: {
    icon: React.ReactNode;
    type: string;
    id: string;
  }) => {
    const deleteBonus = useDeleteMutation({
      endpoint: `/api/bonuses/${id}`,
      successMessage: "Bonus deleted successfully",
      refetchKey: "bonus",
    });

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost">{icon}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {type === "edit" ? "Edit Bonus" : "Delete Bonus"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {type} this bonus?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="w-1/4 text-white bg-red-600 hover:bg-red-600"
              onClick={() => deleteBonus()}
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
      <div>
        <PageHeader title="Bonuses" description="Manage bonuses for employees.">
          <Button className="w-44" onClick={() => setIsBonusOpen(true)}>
            <PlusCircle size={16} /> Add Bonus
          </Button>
        </PageHeader>
      </div>
      <div>
        {/* ✅ Table always visible */}
        <div className="py-6 my-2 space-y-4">
          <Table className="text-md">
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Payroll Month</TableHead>
                <TableHead>Employee Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bonus?.length > 0 ? (
                bonus.map((bonus: Bonus) => (
                  <TableRow key={bonus.id}>
                    <TableCell>{bonus.bonus_type}</TableCell>
                    <TableCell className="py-4">
                      {formatPayrollMonth(bonus.payroll_month)}
                    </TableCell>
                    <TableCell className="py-4">
                      {bonus.first_name} {bonus.last_name}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(bonus.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Alert
                        icon={<Trash className="text-red-500" />}
                        type="bonus"
                        id={bonus.id}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                /* Show empty state row */
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-6 italic text-center text-gray-500"
                  >
                    No bonuses added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {isBonusOpen && (
        <BonusModal
          isOpen={isBonusOpen}
          onClose={() => setIsBonusOpen(false)}
        />
      )}
    </section>
  );
};

export default BonusSettings;
