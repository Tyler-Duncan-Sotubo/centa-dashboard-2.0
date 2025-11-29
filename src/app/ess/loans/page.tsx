"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { Loan } from "@/types/loans.type";
import { ActiveLoanCard } from "./_components/ActiveLoanCard";
import { SettledLoansTable } from "./_components/SettledLoansTable";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import EmptyState from "@/components/empty-state";

export default function LoansPage() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const router = useRouter();

  /* ───────── Fetch loans ───────── */
  const {
    data: loans = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Loan[]>({
    queryKey: ["loans", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          `/api/salary-advance/employee/${session?.user.id}`
        );
        return res.data.data;
      } catch (err) {
        if (isAxiosError(err)) return [];
        throw err;
      }
    },
  });

  /* ───────── Split lists ───────── */
  const openLoans = loans.filter((l) => l.paymentStatus === "open");
  const settledLoans = loans.filter((l) => l.status === "paid");

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <p className="text-red-500">
        Error loading loans.&nbsp;
        <Button variant="link" onClick={() => refetch()}>
          Retry
        </Button>
      </p>
    );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Loans & Salary Advances"
        description="Review active loans and history."
      >
        <Button onClick={() => router.push("/ess/loans/request")}>
          <FaPlus className="mr-1" /> New Request
        </Button>
      </PageHeader>

      {/* ── Active loans ───────────────────────────────────── */}
      {openLoans.length > 0 ? (
        <div>
          {openLoans.map((loan) => (
            <ActiveLoanCard key={loan.loanId} loan={loan} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Active Loans"
          description="You have no active loans or salary advances at the moment."
          image={
            "https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585350/wallet_tcmlzc.svg"
          } // or "/images/empty-jobs.png" from public folder
        />
      )}

      {/* ── Settled loans (DataTable) ──────────────────────── */}
      {settledLoans.length > 0 && (
        <>
          <SettledLoansTable data={settledLoans} />
        </>
      )}
    </div>
  );
}
