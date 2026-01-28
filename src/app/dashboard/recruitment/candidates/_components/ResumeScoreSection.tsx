// _components/ResumeScoreSection.tsx
import React from "react";
import { ApplicationDetails } from "@/types/application";
import PageHeader from "@/shared/ui/page-header";

interface Props {
  score: ApplicationDetails["application"]["resumeScore"] | undefined;
}

const ResumeScoreSection = ({ score }: Props) => {
  if (!score) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI CV Assessment"
        description="View the AI-generated assessment of the candidate's resume."
      />
      <h3 className="text-xl font-semibold">Score {score.score} / 100</h3>
      <div>
        <h4 className="text-xl font-semibold mb-3">Strengths</h4>
        <ul className="list-disc list-inside text-monzo-success text-md space-y-2">
          {score.strengths.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-3">Weaknesses</h4>
        <ul className="list-disc list-inside text-monzo-error text-md space-y-2">
          {score.weaknesses.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResumeScoreSection;
