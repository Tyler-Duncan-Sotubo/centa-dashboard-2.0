"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import LoanModal from "./LoanModal";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle } from "lucide-react";
import { Loan } from "@/types/loans.type";
import { formatCurrency } from "@/utils/formatCurrency";
import EditLoanModal from "./EditLoanModal";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import { formatDate } from "@/utils/formatDate";
import PageHeader from "@/components/pageHeader";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import SalaryAdvanceSettings from "./SalaryAdvanceSettings";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const LoansPage = ({ loans }: { loans: Loan[] | undefined }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  // Filter loans
  const activeLoans = loans?.filter((loan) => loan.status !== "paid");
  const inactiveLoans = loans?.filter((loan) => loan.status === "paid");

  const handleOpenModal = (loan?: Loan) => {
    if (loan) {
      setIsEditing(true);
      setEditingLoan(loan);
    } else {
      setIsEditing(false);
      setEditingLoan(null);
    }
  };

  return (
    <div className="px-6 space-y-6">
      <PageHeader
        title="Salary Advance"
        description="Manage salary advances for employees."
      >
        <Button onClick={() => setIsOpen(true)}>
          <PlusCircle />
          Add Request
        </Button>
      </PageHeader>

      {/* Loan Modal */}
      <LoanModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <EditLoanModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        editingLoan={editingLoan}
        isEditing={isEditing}
      />

      {/* Tabs for Active & Inactive Loans */}
      <Tabs defaultValue="active">
        <TabsList className="my-6">
          <TabsTrigger value="active">Ongoing</TabsTrigger>
          <TabsTrigger value="paid">Settled</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Active Loans */}
        <TabsContent value="active">
          <LoanTable
            loans={activeLoans}
            setIsEditing={setIsEditing}
            handleOpenModal={handleOpenModal}
          />
        </TabsContent>

        {/* Inactive (Paid) Loans */}
        <TabsContent value="paid">
          <LoanTable
            loans={inactiveLoans}
            setIsEditing={setIsEditing}
            handleOpenModal={handleOpenModal}
          />
        </TabsContent>

        <TabsContent value="history">
          <LoanHistoryTab />
        </TabsContent>

        <TabsContent value="settings">
          <SalaryAdvanceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Loan Table Component
const LoanTable = ({
  loans,
  handleOpenModal,
  setIsEditing,
}: {
  loans: Loan[] | undefined;
  handleOpenModal: (loan: Loan) => void;
  setIsEditing: (value: boolean) => void;
}) => {
  return (
    <section>
      <div>
        <h3 className="my-4 text-xl font-semibold">Records</h3>
      </div>
      <div>
        <Table className="text-md">
          <TableHeader>
            <TableRow>
              <TableHead className="py-4">Name</TableHead>
              <TableHead className="py-4">Employee</TableHead>
              <TableHead className="py-4">Amount</TableHead>
              <TableHead className="py-4">Total Paid</TableHead>
              <TableHead className="py-4">Outstanding</TableHead>
              <TableHead className="py-4">Status</TableHead>
              <TableHead className="py-4">Progress</TableHead>
              <TableHead className="py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans && loans.length > 0 ? (
              loans?.map((loan) => (
                <TableRow key={loan.loanId}>
                  <TableCell className="py-4">{loan.name}</TableCell>
                  <TableCell className="py-4">{loan.employeeName}</TableCell>
                  <TableCell className="py-4">
                    {formatCurrency(Number(loan.amount))}
                  </TableCell>
                  <TableCell className="py-4">
                    {formatCurrency(Number(loan.totalPaid))}
                  </TableCell>
                  <TableCell className="py-4">
                    {formatCurrency(Number(loan.outstandingBalance))}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant={
                        loan.status === "approved"
                          ? "approved"
                          : loan.status === "rejected"
                          ? "rejected"
                          : "pending"
                      }
                    >
                      {loan.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Progress
                      value={
                        (Number(loan.totalPaid) / Number(loan.amount)) * 100
                      }
                      className="h-3"
                    />
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleOpenModal(loan);
                        setIsEditing(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-center text-gray-500"
                >
                  No Salary Advance found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

const LoanHistoryTab = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchLoanHistory = async () => {
    try {
      const res = await axiosInstance.get("/api/salary-advance/history");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data: loanHistory, isLoading } = useQuery({
    queryKey: ["loanHistory"],
    queryFn: fetchLoanHistory,
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) {
    return <Loading />;
  }

  return (
    <section>
      <h3 className="my-4 text-xl font-semibold">
        Salary Advance History (Audit Log)
      </h3>
      <div>
        <Table className="text-md">
          <TableHeader>
            <TableRow>
              <TableHead className="py-4">Employee</TableHead>
              <TableHead className="py-4">Action</TableHead>
              <TableHead className="py-4">Reason</TableHead>
              <TableHead className="py-4">Action By</TableHead>
              <TableHead className="py-4 text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loanHistory.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              loanHistory.map((history: any) => (
                <TableRow key={history.id}>
                  <TableCell className="py-4">{history.employee}</TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant={
                        history.action === "approved"
                          ? "approved"
                          : history.action === "rejected"
                          ? "rejected"
                          : "pending"
                      }
                    >
                      {history.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    {history.reason || "—"}
                  </TableCell>
                  <TableCell className="py-4">
                    {history.actionBy === "super_admin"
                      ? "Super Admin"
                      : "Admin"}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    {formatDate(history.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-center text-gray-500"
                >
                  No loan history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default LoansPage;
