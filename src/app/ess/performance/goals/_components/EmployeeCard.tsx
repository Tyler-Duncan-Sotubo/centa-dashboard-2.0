import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/types/performance/goals.type";
import Image from "next/image";

export default function EmployeeCard({ goal }: { goal: Goal }) {
  const avatarUrl =
    goal.avatarUrl ||
    `https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757584748/user-thumbnail_esajvk.gif`;
  const progress = goal.updates?.[0]?.progress ?? 0;

  return (
    <div className="border rounded-lg p-5bg-white shadow-sm flex md:flex-row flex-col justify-between">
      <div>
        <div className="flex items-center gap-4 p-3">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full overflow-hidden border relative">
            <Image
              src={avatarUrl}
              alt={goal.employee}
              fill
              className="object-cover w-full h-full"
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
      <div className="flex flex-col md:w-56 p-3 md:mt-0 mt-6">
        <Badge>
          {progress < 100 && goal.status === "published"
            ? `In Progress`
            : goal.status === "draft"
            ? "Draft"
            : "Completed"}
        </Badge>
        <div className="space-y-4 mt-4 text-center bg-gray-100 p-4 rounded-lg">
          <h2>Progress</h2>
          <h3 className="text-2xl font-bold">{progress}%</h3>
          <Progress value={progress} className="w-full" />
        </div>
      </div>
    </div>
  );
}
