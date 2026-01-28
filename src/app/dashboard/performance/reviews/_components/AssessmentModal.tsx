"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import RenderHtml from "@/shared/ui/render-html";
import { FaEye } from "react-icons/fa";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";

type AssessmentData = {
  id: string;
  summary: string;
  strengths: string;
  areasForImprovement: string;
  finalScore: number;
  promotionRecommendation: "promote" | "hold" | "exit";
  potentialFlag: boolean;
  createdAt: string;
};

export default function AssessmentModal({
  assessmentId,
}: {
  assessmentId: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const {
    data: assessment,
    isLoading,
    isError,
  } = useQuery<AssessmentData | undefined>({
    queryKey: ["assessment", assessmentId],
    queryFn: async () => {
      const res = await axios.get(
        `/api/assessments/${assessmentId}/conclusion`,
      );
      return res.data.data;
    },
    enabled:
      Boolean(session?.backendTokens?.accessToken) && !!assessmentId && open,
  });

  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading assessment data</div>;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="p-0"
        onClick={() => setOpen(true)}
      >
        <FaEye className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">AI Assessment Summary</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h3 className="font-semibold text-base mb-1">Final Summary</h3>
              <RenderHtml html={assessment?.summary ?? ""} />
            </div>

            <div>
              <h3 className="font-semibold text-base mb-1">Strengths</h3>
              <RenderHtml html={assessment?.strengths ?? ""} />
            </div>

            <div>
              <h3 className="font-semibold text-base mb-1">
                Areas for Improvement
              </h3>
              <RenderHtml html={assessment?.areasForImprovement ?? ""} />
            </div>

            <div className="flex items-center justify-between border-t pt-4 mt-4 text-sm">
              <span>
                <strong>Final Score:</strong> {assessment?.finalScore}%
              </span>
              <span>
                <strong>Promotion Recommendation:</strong>{" "}
                <span className="capitalize">
                  {assessment?.promotionRecommendation}
                </span>
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
