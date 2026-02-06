import { Avatars } from "@/shared/ui/avatars";
import { Progress } from "@/shared/ui/progress";
import { Goal } from "@/types/performance/goals.type";

export default function EmployeeCard({ goal }: { goal: Goal }) {
  const avatarUrl = goal.avatarUrl;
  const progress = goal.updates?.[0]?.progress ?? 0;

  return (
    <div className="border rounded-lg p-5 bg-white shadow-2xs flex justify-between">
      <div>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full overflow-hidden border relative">
            <Avatars
              src={avatarUrl}
              name={goal.employee}
              size="xlg"
              className="absolute top-0 left-0"
            />
          </div>
          {/* Info */}
          <div className="space-y-3 text-xmd">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{goal.employee}</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-medium w-24">Department:</p>
              <span>{goal.departmentName}</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-medium w-24">Office:</p>
              <span>{goal.office}</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-medium w-24">Manager:</p>
              <span>{goal.manager}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-56">
        <div className="space-y-4 mt-4 text-center bg-gray-100 p-4 rounded-lg">
          <h2>Progress</h2>
          <h3 className="text-2xl font-bold">{progress}%</h3>
          <Progress value={progress} className="w-full" />
        </div>
      </div>
    </div>
  );
}
