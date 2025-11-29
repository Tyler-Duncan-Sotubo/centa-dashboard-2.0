"use client";

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
  name: string;
  completed: boolean;
};

type Props = {
  checklist: ChecklistItem[];
  employeeName: string;
};

export default function OffboardingChecklistModal({
  checklist,
  employeeName,
}: Props) {
  const total = checklist.length;
  const completed = checklist.filter((item) => item.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  const updateChecklistStatus = useUpdateMutation({
    endpoint: `/api/offboarding/update-checklist`, // This will be appended with item ID
    successMessage: "Checklist item marked as completed",
    refetchKey: "offboarding-sessions",
  });

  const handleChecklistUpdate = async (checklistItemId: string) => {
    await updateChecklistStatus({
      checklistItemId,
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
            {employeeName}&apos;s Offboarding Checklist
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 mt-2">
          <Progress value={percent} />
          <div className="text-sm text-muted-foreground mt-1">
            {completed} of {total} tasks completed ({percent}%)
          </div>
        </div>

        {checklist.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm mt-10">
            No checklist assigned to this session.
          </p>
        ) : (
          <ScrollArea className="pr-2">
            <ul className="space-y-4">
              {checklist.map((item) => {
                const isComplete = item.completed;
                return (
                  <li
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                    </div>

                    {isComplete ? (
                      <Badge variant="approved">
                        <CheckCircle className="w-4 h-4 mr-1" /> Completed
                      </Badge>
                    ) : (
                      <button
                        className="focus:outline-none"
                        onClick={() => handleChecklistUpdate(item.id)}
                      >
                        <Badge variant="pending" role="button">
                          <Clock className="w-4 h-4 mr-1" /> Mark complete
                        </Badge>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
