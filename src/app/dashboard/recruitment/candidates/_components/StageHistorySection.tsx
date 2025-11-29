import React from "react";
import { StageHistoryItem, stageHistoryColumns } from "./StageHistoryColumns";
import { DataTable } from "@/components/DataTable";
import PageHeader from "@/components/pageHeader";

const StageHistorySection = ({
  stageHistory,
}: {
  stageHistory: StageHistoryItem[] | undefined;
}) => {
  if (!stageHistory || stageHistory.length === 0) {
    return <p className="text-muted-foreground">No stage history found.</p>;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Stage History"
        description="View the history of stages this candidate has moved through."
      />
      <DataTable columns={stageHistoryColumns} data={stageHistory} />
    </div>
  );
};

export default StageHistorySection;
