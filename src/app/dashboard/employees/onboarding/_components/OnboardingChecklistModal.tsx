import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Clock } from "lucide-react";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";

type ChecklistItem = {
  id: string;
  title: string;
  order: number;
  dueDaysAfterStart: number;
  status?: "completed" | "pending"; // Optional now
};

type Props = {
  checklist: ChecklistItem[];
  employeeName: string;
  employeeId: string;
};

export default function OnboardingChecklistModal({
  checklist,
  employeeName,
  employeeId,
}: Props) {
  const total = checklist.length;
  const completed = checklist.filter((c) => c.status === "completed").length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  const updateChecklistStatus = useUpdateMutation({
    endpoint: `/api/onboarding/employee-checklist/${employeeId}`,
    successMessage: "Checklist updated successfully",
    refetchKey: "onboarding-employees",
  });

  const handleChecklistUpdate = async (checklistId: string) => {
    await updateChecklistStatus({
      checklistId: checklistId,
      status: "completed",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <Progress value={percent} />
          <div className="text-sm text-muted-foreground mt-1">
            {completed} of {total} tasks completed ({percent}%)
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-xl min-h-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {employeeName}&apos;s Onboarding Checklist
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Progress value={percent} />
          <div className="text-sm text-muted-foreground mt-1">
            {completed} of {total} tasks completed ({percent}%)
          </div>
        </div>

        <ScrollArea className="pr-2">
          <ul className="space-y-4">
            {checklist.map((item) => {
              const isComplete = item.status === "completed";
              const lowerTitle = item.title.toLowerCase();
              const shouldDisable =
                lowerTitle.includes("basic") ||
                lowerTitle.includes("bank") ||
                lowerTitle.includes("tax") ||
                lowerTitle.includes("upload");

              return (
                <li key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <span className="text-xs text-muted-foreground">
                      Due Day {item.dueDaysAfterStart}
                    </span>
                  </div>

                  {isComplete ? (
                    <Badge variant="approved">
                      <CheckCircle className="w-4 h-4 mr-1" /> Completed
                    </Badge>
                  ) : (
                    <button
                      className="focus:outline-none"
                      onClick={() => handleChecklistUpdate(item.id)}
                      disabled={shouldDisable}
                    >
                      <Badge
                        variant="pending"
                        role="button"
                        className={
                          shouldDisable ? "opacity-50 cursor-not-allowed" : ""
                        }
                      >
                        <Clock className="w-4 h-4 mr-1" /> Mark complete
                      </Badge>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
