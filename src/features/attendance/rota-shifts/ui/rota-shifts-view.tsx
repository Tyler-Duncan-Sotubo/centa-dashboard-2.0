import PageHeader from "@/shared/ui/page-header";
import { ShiftCalendar } from "./shift-calendar";

export function RotaShiftsView() {
  return (
    <div className="px-4">
      <PageHeader
        title="Rota Shifts"
        description="Manage and view employee shifts in the calendar."
      />
      <ShiftCalendar />
    </div>
  );
}
