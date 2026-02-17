"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { RichTextEditor } from "@/shared/ui/rich-text-editor";
import RenderHtml from "@/shared/ui/render-html";

type Props = {
  assessmentId: string;
  initialSummary?: string;
  disabled?: boolean;
};

export default function SelfSummarySection({
  assessmentId,
  initialSummary = "",
  disabled,
}: Props) {
  const [summary, setSummary] = useState(initialSummary);
  const [isEditing, setIsEditing] = useState(!initialSummary);

  useEffect(() => setSummary(initialSummary), [initialSummary]);

  const upsert = useCreateMutation<{ summary: string }>({
    endpoint: `/api/performance-assessments/self/${assessmentId}/summary`,
    successMessage: "Summary saved",
    refetchKey: "assessment",
  });

  const handleSave = async () => {
    if (!summary.trim()) return;
    await upsert({ summary });
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Self Summary</h2>
          <p className="text-sm text-muted-foreground">
            Summarize your impact this cycle (wins, challenges, learning, next
            focus).
          </p>
        </div>

        {!disabled && initialSummary && !isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      {isEditing && !disabled ? (
        <>
          <RichTextEditor value={summary} onChange={setSummary} />
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!summary.trim()}>
              Save Summary
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-2">
          {summary ? (
            <RenderHtml html={summary} />
          ) : (
            <p className="text-muted-foreground text-sm">
              No summary provided.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
