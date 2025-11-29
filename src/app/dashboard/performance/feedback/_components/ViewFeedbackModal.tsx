"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import Loading from "@/components/ui/loading";
import { Feedback } from "@/types/performance/feedback.type";
import { formatSource } from "@/utils/formatSource";

type Props = {
  open: boolean;
  onClose: () => void;
  id: string | null;
};

export default function ViewFeedbackModal({ open, onClose, id }: Props) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const {
    data: feedback = null,
    isLoading,
    isError,
  } = useQuery<Feedback>({
    queryKey: ["feedback"],
    queryFn: async () => {
      const res = await axios.get(`/api/feedback/${id}`);
      return res.data.data;
    },
    enabled: !!session?.backendTokens.accessToken,
  });

  if (isLoading) return <Loading />;
  if (!feedback || isLoading || isError) return <p>Error loading data</p>;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl min-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Feedback{" "}
            {feedback?.isAnonymous
              ? "(Anonymous)"
              : `by ${feedback?.senderName}`}
          </DialogTitle>
        </DialogHeader>

        <div className=" mt-2">
          <div className="bg-muted/50 p-4 rounded-xl border space-y-2 text-xmd font-semibold">
            <p className="text-muted-foreground">
              <span className="font-medium">Employee:</span>{" "}
              <span>{feedback?.employeeName || "N/A"}</span>
            </p>

            <p className="text-muted-foreground">
              <span className="font-medium">Feedback Type:</span>{" "}
              <span className="capitalize">
                {formatSource(feedback?.type) || "N/A"}
              </span>
            </p>

            <p className="text-muted-foreground">
              <span className="font-medium">Submitted:</span>{" "}
              <span>
                {feedback?.createdAt
                  ? format(new Date(feedback.createdAt), "PPPp")
                  : "N/A"}
              </span>
            </p>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            {Array.isArray(feedback.responses) &&
              feedback.responses.map((r, i) => (
                <div key={i} className="space-y-1">
                  <p className="font-medium ">{r.questionText}</p>
                  <div className="bg-gray-50 p-3 rounded-md border">
                    <p className="text-xmd text-muted-foreground whitespace-pre-wrap">
                      {r.answer}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
