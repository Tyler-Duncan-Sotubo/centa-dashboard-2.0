"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
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
} from "@/components/ui/alert-dialog";
import { CentaAISuggest } from "@/components/ui/centa-ai-suggest";
import FormError from "@/components/ui/form-error";
import { AppraisalEntry } from "@/types/performance/appraisal.type";
import RenderHtml from "@/components/ui/render-html";

interface EvaluationFormProps {
  appraisalId: string | null;
  entries: AppraisalEntry[];
  employeeName: string | null;
}

export default function EvaluationForm({
  appraisalId,
  entries,
  employeeName,
}: EvaluationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [promotionRecommendation, setPromotionRecommendation] = useState<
    "promote" | "hold" | "exit" | ""
  >("");
  const [finalNote, setFinalNote] = useState("");
  const [aiOutput, setAiOutput] = useState<{
    suggestedFinalScore?: number;
    suggestedPromotionRecommendation?: string;
    finalNote?: string;
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const updateAppraisal = useUpdateMutation({
    endpoint: `/api/appraisals/${appraisalId}`,
    successMessage: "Evaluation saved successfully",
    onSuccess: () => {
      setIsLoading(false);
    },
    refetchKey: "appraisal-entries participants",
  });

  const handleSubmit = () => {
    updateAppraisal({
      finalScore,
      promotionRecommendation,
      finalNote,
    });
  };

  const generateWithAI = async () => {
    setIsLoading(true);
    setAiError(null);
    if (entries.length === 0 || !employeeName) {
      setAiError("No entries available for AI evaluation");
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/evaluate-levels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeName,
          levels: entries,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to get AI response");
      }

      setAiOutput({
        suggestedFinalScore: data.suggestedFinalScore,
        suggestedPromotionRecommendation: data.suggestedPromotionRecommendation,
        finalNote: data.finalNote,
      });

      if (data.finalNote) {
        setFinalNote(data.finalNote); // Set the editor content
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setAiError(error.message || "Failed to generate AI insights");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 mb-10">
      {aiError && <FormError message={aiError} />}

      <div>
        {aiOutput?.finalNote !== undefined && (
          <p className="text-sm text-muted-foreground">
            AI Generated Note:{" "}
            <span className="font-semibold">
              <RenderHtml html={aiOutput.finalNote ?? ""} />
            </span>
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="block  font-semibold">Final Note</h4>
          <Button onClick={generateWithAI} variant="link" disabled={isLoading}>
            <CentaAISuggest isLoading={isLoading} />
          </Button>
        </div>

        <RichTextEditor value={finalNote} onChange={setFinalNote} />
      </div>

      <section className="flex justify-between items-start gap-10">
        <div className="space-y-5 w-1/3">
          <h4 className="block mb-2 font-semibold">Final Score</h4>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[finalScore]}
            onValueChange={([val]) => setFinalScore(val)}
          />
          <p className="text-sm mt-1 text-muted-foreground">
            Selected Score: <span className="font-medium">{finalScore}</span>
          </p>
          {aiOutput?.suggestedFinalScore !== undefined && (
            <p className="text-sm text-muted-foreground">
              AI Suggested Score:{" "}
              <span className="font-semibold">
                {aiOutput.suggestedFinalScore}
              </span>
            </p>
          )}
        </div>

        <div className="justify-end space-y-5">
          <h4 className="block font-semibold">Promotion Recommendation</h4>
          <RadioGroup
            value={promotionRecommendation}
            onValueChange={(val) =>
              setPromotionRecommendation(val as "promote" | "hold" | "exit")
            }
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="promote" id="promote" />
              <Label htmlFor="promote">Promote</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hold" id="hold" />
              <Label htmlFor="hold">Hold</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="exit" id="exit" />
              <Label htmlFor="exit">Exit</Label>
            </div>
          </RadioGroup>
          {aiOutput?.suggestedPromotionRecommendation && (
            <p className="text-sm text-muted-foreground mt-2">
              AI Recommendation:{" "}
              <span className="font-semibold capitalize">
                {aiOutput.suggestedPromotionRecommendation}
              </span>
            </p>
          )}
        </div>
      </section>

      <div className="flex justify-end">
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button disabled={isLoading}>Save Evaluation</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Evaluation Submission</AlertDialogTitle>
              <AlertDialogDescription>
                This will update the final evaluation. Are you sure you want to
                proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleSubmit();
                  setConfirmOpen(false);
                }}
              >
                Yes, Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
