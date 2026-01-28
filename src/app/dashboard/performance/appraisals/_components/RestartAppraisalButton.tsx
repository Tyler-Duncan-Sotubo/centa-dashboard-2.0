import { useState } from "react";
import { IoRefreshCircle } from "react-icons/io5";
import { Button } from "@/shared/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/ui/alert-dialog";
import { useDeleteMutation } from "@/shared/hooks/useDeleteMutation";

type Props = {
  appraisalId: string;
};

export function RestartAppraisalButton({ appraisalId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const restartAppraisal = useDeleteMutation({
    endpoint: `/api/appraisals/${appraisalId}/restart`,
    successMessage: "Appraisal restarted successfully",
    onSuccess: () => {
      setOpen(false);
    },
    refetchKey: "appraisal-entries participants",
  });

  const handleRestart = async () => {
    setLoading(true);
    try {
      await restartAppraisal();
    } catch (error) {
      console.error("Error restarting appraisal:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          <IoRefreshCircle className="mr-2" />
          Restart Appraisal
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restart Appraisal</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all associated ratings and reset the
            appraisal state. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestart} disabled={loading}>
            {loading ? "Restarting..." : "Confirm Restart"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
