"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { RichTextEditor } from "@/shared/ui/rich-text-editor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Slider } from "@/shared/ui/slider";
import { Button } from "@/shared/ui/button";
import { CentaAISuggest } from "@/shared/ui/centa-ai-suggest";
import CompetencyRadarChartCard from "./CompetencyRadarChart";
import { Question } from "@/types/performance/question-competency.type";
import FormError from "@/shared/ui/form-error";
import RenderHtml from "@/shared/ui/render-html";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

type ReviewStatus = "draft" | "pending_hr" | "needs_changes" | "approved";

type ConclusionPayload = {
  summary: string;
  strengths: string;
  areasForImprovement: string;
  finalScore: number;
  promotionRecommendation?: string;
};

type Conclusion = {
  summary: string;
  strengths: string;
  areasForImprovement: string;
  finalScore?: number | string | null;
  promotionRecommendation?: string;

  // workflow fields returned from backend
  reviewStatus?: ReviewStatus;
  changesRequestNote?: string | null;
  changesRequestedAt?: string | null;
  submittedToHrAt?: string | null;
  hrApprovedAt?: string | null;
};

type ConclusionSectionProps = {
  conclusion: Conclusion;
  onChange: (field: keyof Conclusion, value: unknown) => void;
  questions: Record<string, Question[]>;
  employeeName?: string;
  role?: string; // "employee" | "manager" | "hr" | "admin" etc (your app)
  assessmentId?: string;
};

function statusLabel(status?: ReviewStatus) {
  switch (status) {
    case "draft":
      return "Draft";
    case "needs_changes":
      return "Needs changes";
    case "pending_hr":
      return "Pending HR";
    case "approved":
      return "Approved";
    default:
      return "Draft";
  }
}

export default function ConclusionSection({
  conclusion,
  onChange,
  questions,
  employeeName = "The employee",
  role = "employee",
  assessmentId,
}: ConclusionSectionProps) {
  const router = useRouter();

  // AI states
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState<{
    strengths: string;
    areasForImprovement: string;
    fullAssessment: string;
    suggestedFinalScore?: number;
    suggestedPromotionRecommendation?: string;
  } | null>(null);

  // workflow states
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);

  // dialogs
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitToHrOpen, setSubmitToHrOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [changeNote, setChangeNote] = useState("");

  const finalScoreValue = Number(conclusion.finalScore) || 0;
  const localKey = `ai_conclusion_${employeeName}`;

  const reviewStatus: ReviewStatus = (conclusion.reviewStatus ??
    "draft") as ReviewStatus;

  // You should ideally use permissions from auth context. This is a simple role-based example.
  const isHR = useMemo(
    () => ["hr_manager", "admin", "super_admin"].includes(role),
    [role],
  );
  const isManager = useMemo(
    () => ["manager", "hr_manager"].includes(role),
    [role],
  );

  const canEditAsManager = useMemo(
    () =>
      isManager &&
      (reviewStatus === "draft" || reviewStatus === "needs_changes"),
    [isManager, reviewStatus],
  );

  const canEditAsHR = useMemo(
    () => isHR && reviewStatus === "pending_hr",
    [isHR, reviewStatus],
  );

  // If you want HR to edit during pending_hr via PATCH, allow editor when HR
  const editorsDisabled = useMemo(() => {
    if (reviewStatus === "approved") return true;
    if (reviewStatus === "pending_hr") return !isHR; // managers locked during HR review
    // draft / needs_changes
    return !isManager; // only manager edits in these stages (matches your service)
  }, [reviewStatus, isHR, isManager]);

  const isFormComplete = useMemo(() => {
    return (
      !!conclusion.summary &&
      !!conclusion.strengths &&
      !!conclusion.areasForImprovement &&
      conclusion.finalScore !== undefined &&
      conclusion.promotionRecommendation !== undefined
    );
  }, [conclusion]);

  // -------------------------
  // AI generation
  // -------------------------
  const generateWithAI = async () => {
    localStorage.removeItem(localKey);
    setIsGeneratingAI(true);
    setAiError(null);

    try {
      const res = await fetch("/api/generate-conclusion", {
        method: "POST",
        body: JSON.stringify({ questions, employeeName, role }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      localStorage.setItem(localKey, JSON.stringify(data));

      setAiOutput({
        strengths: data.strengths,
        areasForImprovement: data.areasForImprovement,
        fullAssessment: data.fullAssessment,
        suggestedFinalScore: data.suggestedFinalScore,
        suggestedPromotionRecommendation: data.suggestedPromotionRecommendation,
      });
    } catch (error) {
      console.error("AI generation error:", error);
      setAiError("AI generation failed. Please try again.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(localKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setAiOutput({
        strengths: parsed.strengths,
        areasForImprovement: parsed.areasForImprovement,
        fullAssessment: parsed.fullAssessment,
        suggestedFinalScore: parsed.suggestedFinalScore,
        suggestedPromotionRecommendation:
          parsed.suggestedPromotionRecommendation,
      });
    } catch (e) {
      console.error("Invalid AI conclusion in storage", e);
    }
  }, [localKey]);

  // -------------------------
  // API helpers (workflow)
  // -------------------------

  const createConclusion = useCreateMutation<ConclusionPayload>({
    endpoint: `/api/assessments/${assessmentId}/conclusion`,
    successMessage: "Draft saved",
    onSuccess: () => router.refresh?.(),
  });

  const updateConclusion = useUpdateMutation<Partial<ConclusionPayload>>({
    endpoint: `/api/assessments/${assessmentId}/conclusion`,
    successMessage: "Draft updated",
    onSuccess: () => router.refresh?.(),
  });

  // workflow actions
  const submitToHrMutation = useCreateMutation<void>({
    endpoint: `/api/assessments/${assessmentId}/conclusion/submit-to-hr`,
    successMessage: "Submitted to HR",
  });

  const requestChangesMutation = useCreateMutation<{ note: string }>({
    endpoint: `/api/assessments/${assessmentId}/conclusion/request-changes`,
    successMessage: "Changes requested",
    onSuccess: () => router.refresh?.(),
  });

  const approveMutation = useCreateMutation<void>({
    endpoint: `/api/assessments/${assessmentId}/conclusion/approve`,
    successMessage: "Approved",
    onSuccess: () => router.refresh?.(),
  });

  const hasExistingConclusion = conclusion.reviewStatus !== undefined;

  const payload: ConclusionPayload = {
    summary: conclusion.summary,
    strengths: conclusion.strengths,
    areasForImprovement: conclusion.areasForImprovement,
    finalScore: finalScoreValue,
    promotionRecommendation: conclusion.promotionRecommendation,
  };

  const saveDraft = async () => {
    if (!assessmentId) return;
    setActionError?.(null);

    // if your UI passes setActionError state setter, pass it into hook
    if (hasExistingConclusion) {
      await updateConclusion(payload, setActionError);
    } else {
      await createConclusion(payload, setActionError);
    }
  };

  const submitToHR = async () => {
    if (!assessmentId) return;
    setActionError?.(null);

    // 1) save latest
    if (hasExistingConclusion) {
      await updateConclusion(payload, setActionError);
    } else {
      await createConclusion(payload, setActionError);
    }

    // 2) submit to HR
    await submitToHrMutation(undefined, setActionError);

    localStorage.removeItem(localKey);
    router.push("/dashboard/performance/reviews");
    router.refresh?.();
  };

  const requestChanges = async () => {
    if (!assessmentId) return;

    if (!changeNote.trim()) {
      setActionError?.("Please provide a note for the line manager.");
      return;
    }

    await requestChangesMutation({ note: changeNote.trim() }, setActionError);
    setChangeNote("");
  };

  const approve = async () => {
    if (!assessmentId) return;
    await approveMutation(undefined, setActionError);
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <>
      {questions && <CompetencyRadarChartCard questions={questions} />}

      {/* Status banner */}
      <div className="mt-6 rounded-lg border p-3 flex items-start justify-between gap-4">
        <div className="text-sm">
          <div>
            <span className="font-medium">Status:</span>{" "}
            <span className="capitalize">{statusLabel(reviewStatus)}</span>
          </div>

          {reviewStatus === "needs_changes" &&
            conclusion.changesRequestNote && (
              <div className="mt-2 text-muted-foreground">
                <span className="font-medium">HR note:</span>{" "}
                {conclusion.changesRequestNote}
              </div>
            )}

          {reviewStatus === "pending_hr" && (
            <div className="mt-2 text-muted-foreground">
              HR is reviewing. Line manager editing is locked.
            </div>
          )}

          {reviewStatus === "approved" && (
            <div className="mt-2 text-muted-foreground">
              Approved and locked.
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Manager actions */}
          {isManager &&
            (reviewStatus === "draft" || reviewStatus === "needs_changes") && (
              <Button
                type="button"
                variant="secondary"
                onClick={saveDraft}
                disabled={isActing || !isFormComplete}
              >
                Save Draft
              </Button>
            )}

          {/* HR actions */}
          {isHR && reviewStatus === "pending_hr" && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setRequestChangesOpen(true)}
                disabled={isActing}
              >
                Request changes
              </Button>
              <Button
                type="button"
                onClick={() => setApproveOpen(true)}
                disabled={isActing}
              >
                Approve
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 mb-2">
        <h3 className="text-lg font-medium">Conclusion</h3>
        <Button
          type="button"
          onClick={generateWithAI}
          variant="link"
          disabled={isGeneratingAI}
        >
          <CentaAISuggest isLoading={isGeneratingAI} />
        </Button>
      </div>

      {aiError && <FormError message={aiError} />}
      {actionError && <FormError message={actionError} />}

      {aiOutput?.fullAssessment && (
        <div className="mt-8">
          <h4 className="text-md font-medium mb-2">AI Full Assessment</h4>
          <RenderHtml html={aiOutput.fullAssessment} />
        </div>
      )}

      <Accordion
        type="multiple"
        defaultValue={["summary", "strengths", "areasForImprovement"]}
        className="space-y-4"
      >
        <AccordionItem value="summary">
          <AccordionTrigger className="text-lg">Final Summary</AccordionTrigger>
          <AccordionContent>
            <RichTextEditor
              value={conclusion.summary}
              onChange={(val) => onChange("summary", val)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="strengths">
          <AccordionTrigger className="text-lg">Strengths</AccordionTrigger>
          <AccordionContent>
            {aiOutput?.strengths && (
              <div className="mb-4">
                <p className="text-muted-foreground font-medium mb-1">
                  AI Suggestion:
                </p>
                <RenderHtml html={aiOutput.strengths} />
              </div>
            )}
            <RichTextEditor
              value={conclusion.strengths}
              onChange={(val) => onChange("strengths", val)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="areasForImprovement">
          <AccordionTrigger className="text-lg">
            Areas for Improvement
          </AccordionTrigger>
          <AccordionContent>
            {aiOutput?.areasForImprovement && (
              <div className="mb-4">
                <p className="text-muted-foreground font-medium mb-1">
                  AI Suggestion:
                </p>
                <RenderHtml html={aiOutput.areasForImprovement} />
              </div>
            )}
            <RichTextEditor
              value={conclusion.areasForImprovement}
              onChange={(val) => onChange("areasForImprovement", val)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-between mt-6">
        <div className="flex flex-col space-y-4 w-1/2">
          <p className="mb-2 font-medium text-lg">Score: {finalScoreValue}</p>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[finalScoreValue]}
            onValueChange={(val) => onChange("finalScore", val[0])}
            className="w-full"
            disabled={editorsDisabled}
          />
          {aiOutput?.suggestedFinalScore !== undefined && (
            <p className="text-md text-muted-foreground">
              AI Suggested Score:{" "}
              <strong>{aiOutput.suggestedFinalScore}</strong>
            </p>
          )}
        </div>

        <div className="w-48">
          <Select
            value={conclusion.promotionRecommendation}
            onValueChange={(val) => onChange("promotionRecommendation", val)}
            disabled={editorsDisabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Promotion?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="promote">Promote</SelectItem>
              <SelectItem value="hold">Hold</SelectItem>
              <SelectItem value="exit">Exit</SelectItem>
            </SelectContent>
          </Select>

          {aiOutput?.suggestedPromotionRecommendation && (
            <p className="text-md text-muted-foreground mt-3">
              AI Recommendation:{" "}
              <strong className="capitalize">
                {aiOutput.suggestedPromotionRecommendation}
              </strong>
            </p>
          )}
        </div>
      </div>

      {/* Manager: Submit to HR */}
      {isManager &&
        (reviewStatus === "draft" || reviewStatus === "needs_changes") && (
          <div className="flex justify-end">
            <AlertDialog open={submitToHrOpen} onOpenChange={setSubmitToHrOpen}>
              <AlertDialogTrigger asChild>
                <Button className="mt-6" disabled={isActing || !isFormComplete}>
                  Submit to HR
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Submit to HR?</AlertDialogTitle>
                  <AlertDialogDescription>
                    HR will review your conclusion. You won’t be able to edit
                    while it’s pending HR review. If HR requests changes, you
                    can edit again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setSubmitToHrOpen(false);
                      submitToHR();
                    }}
                  >
                    Yes, submit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

      {/* HR: Request Changes dialog */}
      <AlertDialog
        open={requestChangesOpen}
        onOpenChange={setRequestChangesOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request changes</AlertDialogTitle>
            <AlertDialogDescription>
              Add a note explaining what needs to be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4">
            <textarea
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              className="w-full min-h-30 rounded-md border p-3 text-sm"
              placeholder="Write your note to the line manager..."
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setChangeNote("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                requestChanges();
                setRequestChangesOpen(false);
              }}
            >
              Send
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* HR: Approve dialog */}
      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve conclusion?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve and lock the conclusion. It can’t be edited
              afterward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setApproveOpen(false);
                approve();
              }}
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* (Optional) keep old dialog but repurpose if you still want it.
          I’m leaving it here turned off; you can remove it safely. */}
      {false && (
        <div className="flex justify-end">
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button className="mt-6">Submit Conclusion</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will submit your final evaluation.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setConfirmOpen(false);
                    // submit
                  }}
                >
                  Yes, Submit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </>
  );
}
