"use client";

import { useState } from "react";
import { Expense, ExpenseColumns } from "./_components/ExpenseColumns";
import { DataTable } from "@/components/DataTable";
import { ExpenseSummaryCards } from "./_components/ExpenseSummaryCards";
import { ExpenseFilters } from "./_components/ExpenseFilters";
import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import { ExpenseModal } from "./_components/ExpenseModal";
import BulkUploadModal from "@/components/common/BulkUploadModal";
import { LuImport } from "react-icons/lu";
import { GiPayMoney } from "react-icons/gi";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import EmptyState from "@/components/empty-state";

const ExpensePage = () => {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    requester: "all",
    category: "all",
    status: "all",
  });

  const fetchExpenses = async () => {
    try {
      const res = await axiosInstance.get("/api/expenses");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const { data, isLoading, isError } = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
    enabled: !!session?.backendTokens.accessToken,
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) return <Loading />;
  if (isError) return <div>Error fetching employees</div>;

  const filteredData = data?.filter((expense) => {
    const { requester, category, status } = filters;
    const statusMatch =
      status === "all" || expense.status.toLowerCase() === status;
    const requesterMatch =
      requester === "all" || expense.requester === requester;
    const categoryMatch = category === "all" || expense.category === category;
    return statusMatch && requesterMatch && categoryMatch;
  });

  return (
    <div className="px-5">
      <PageHeader
        title="Expenses"
        description="Manage and track expenses efficiently."
        icon={<GiPayMoney className="h-6 w-6" />}
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setIsOpen(true);
            }}
            variant={"outline"}
          >
            <LuImport />
            Import
          </Button>

          <ExpenseModal />
        </div>
      </PageHeader>

      {data?.length === 0 ? (
        <div className="mt-20">
          <EmptyState
            title="No Expenses Found"
            description="You haven't added any expenses yet. Start tracking your expenses now."
            image="https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585351/expense_dypnis.svg"
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
};

export default ExpensePage;
