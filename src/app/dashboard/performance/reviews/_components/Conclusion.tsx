"use client";

import { useEffect, useState } from "react";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CentaAISuggest } from "@/components/ui/centa-ai-suggest";
import CompetencyRadarChartCard from "./CompetencyRadarChart";
import { Question } from "@/types/performance/question-competency.type";
import FormError from "@/components/ui/form-error";
import RenderHtml from "@/components/ui/render-html";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useRouter } from "next/navigation";

type Conclusion = {
  summary: string;
  strengths: string;
  areasForImprovement: string;
  finalScore?: number | string | null;
  promotionRecommendation?: string;
};

type ConclusionSectionProps = {
  conclusion: Conclusion;
  onChange: (field: keyof Conclusion, value: unknown) => void;
  questions: Record<string, Question[]>;
  employeeName?: string;
  role?: string;
  assessmentId?: string;
};

export default function ConclusionSection({
  conclusion,
  onChange,
  questions,
  employeeName = "The employee",
  role = "employee",
  assessmentId,
}: ConclusionSectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState<{
    strengths: string;
    areasForImprovement: string;
    fullAssessment: string;
    suggestedFinalScore?: number;
    suggestedPromotionRecommendation?: string;
  } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const finalScoreValue = Number(conclusion.finalScore) || 0;
  const localKey = `ai_conclusion_${employeeName}`;

  const generateWithAI = async () => {
    localStorage.removeItem(localKey);
    setIsLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/generate-conclusion", {
        method: "POST",
        body: JSON.stringify({ questions, employeeName, role }),
        headers: { "Content-Type": "application/json" },
      });
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(localKey);
    if (saved) {
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
    }
  }, [localKey]);

  const submitConclusion = useCreateMutation({
    endpoint: `/api/assessments/${assessmentId}/conclusion`,
    successMessage: "Conclusion submitted successfully!",
    onSuccess: () => {
      localStorage.removeItem(localKey);
      router.push("/dashboard/performance/reviews");
    },
  });

  const handleSubmit = () => {
    if (isLoading) return;

    const data = {
      summary: conclusion.summary,
      strengths: conclusion.strengths,
      areasForImprovement: conclusion.areasForImprovement,
      finalScore: finalScoreValue,
      promotionRecommendation: conclusion.promotionRecommendation,
    };

    submitConclusion(data);
  };

  return (
    <>
      {questions && <CompetencyRadarChartCard questions={questions} />}

      <div className="flex items-center justify-between mt-6 mb-2">
        <h3 className="text-lg font-medium">Conclusion</h3>
        <Button
          type="button"
          onClick={generateWithAI}
          variant="link"
          disabled={isLoading}
        >
          <CentaAISuggest isLoading={isLoading} />
        </Button>
      </div>

      {aiError && <FormError message={aiError} />}

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
      <div className="flex justify-end">
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button
              className="mt-6"
              disabled={
                isLoading ||
                !conclusion.summary ||
                !conclusion.strengths ||
                !conclusion.areasForImprovement ||
                conclusion.finalScore === undefined ||
                conclusion.promotionRecommendation === undefined
              }
            >
              Submit Conclusion
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will submit your final evaluation. You won’t be able to
                edit it afterward.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setConfirmOpen(false);
                  handleSubmit();
                }}
              >
                Yes, Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
