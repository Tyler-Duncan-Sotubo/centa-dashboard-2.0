import React from "react";
import ShiftCalendar from "../_components/ShiftCalendar";
import PageHeader from "@/components/pageHeader";

const page = () => {
  return (
    <div className="px-4">
      <PageHeader
        title="Rota Shifts"
        description="Manage and view employee shifts in the calendar."
      />
      <ShiftCalendar />
    </div>
  );
};

export default page;
