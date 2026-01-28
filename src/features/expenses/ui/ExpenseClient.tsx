"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/shared/ui/data-table";
import PageHeader from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import BulkUploadModal from "@/shared/ui/bulk-upload-modal";
import { LuImport } from "react-icons/lu";
import { GiPayMoney } from "react-icons/gi";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import EmptyState from "@/shared/ui/empty-state";
import { Expense, ExpenseColumns } from "./ExpenseColumns";
import { ExpenseFilters } from "./ExpenseFilters";
import { ExpenseSummaryCards } from "./ExpenseSummaryCards";
import { ExpenseModal } from "./ExpenseModal";
import { Receipt } from "lucide-react";

export default function ExpenseClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    requester: "all",
    category: "all",
    status: "all",
  });

  const expensesQuery = useQuery<Expense[]>({
    queryKey: ["expenses"],
    enabled: Boolean(session?.backendTokens?.accessToken),
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      const res = await axios.get("/api/expenses");
      return res.data.data ?? [];
    },
  });

  const data = expensesQuery.data ?? [];

  const filteredData = useMemo(() => {
    const { requester, category, status } = filters;

    return data.filter((expense) => {
      const statusMatch = status === "all" || expense.status === status;
      const requesterMatch =
        requester === "all" || expense.requester === requester;
      const categoryMatch = category === "all" || expense.category === category;
      return statusMatch && requesterMatch && categoryMatch;
    });
  }, [data, filters]);

  if (expensesQuery.isLoading) return <Loading />;
  if (expensesQuery.isError) return <div>Error fetching expenses</div>;

  return (
    <div className="px-5">
      <PageHeader
        title="Expenses"
        description="Manage and track expenses efficiently."
        icon={<GiPayMoney className="h-6 w-6" />}
      >
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsOpen(true)} variant="outline">
            <LuImport className="mr-2" />
            Import
          </Button>

          <ExpenseModal />
        </div>
      </PageHeader>

      {data.length === 0 ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <EmptyState
            title="No Expenses Found"
            description="You haven't added any expenses yet. Start tracking your expenses now."
            icon={<Receipt className="h-20 w-20 text-brand mx-auto" />}
          />
        </div>
      ) : (
        <>
          <ExpenseSummaryCards data={data} />

          <div className="flex justify-end">
            <ExpenseFilters
              data={data}
              filters={filters}
              onChange={setFilters}
            />
          </div>

          <DataTable columns={ExpenseColumns} data={filteredData} />
        </>
      )}

      <BulkUploadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Bulk Upload Expenses"
        endpoint="/api/expenses/bulk"
        refetchKey="expenses"
        successMessage="Expenses uploaded successfully"
        exampleDownloadHref="https://res.cloudinary.com/dw1ltt9iz/raw/upload/v1757585681/expenses_gtdbzn.csv"
        exampleDownloadLabel=""
      />
    </div>
  );
}
