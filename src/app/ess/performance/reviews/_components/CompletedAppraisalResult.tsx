import React from "react";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import RenderHtml from "@/components/ui/render-html";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";

type Competency = {
  competencyId: string;
  competencyName: string;
  expectedLevelName: string;
  employeeLevelName: string;
  managerLevelName: string;
  notes: string;
};

type AppraisalResultProps = {
  competencies: Competency[];
  finalScore: number;
  recommendation: string;
  finalNote?: string;
};

const CompletedAppraisalResult: React.FC<AppraisalResultProps> = ({
  competencies,
  finalScore,
  recommendation,
  finalNote,
}) => {
  return (
    <div className="space-y-6 mt-10">
      <div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Appraisal Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-muted-foreground">Final Score:</span>
              <div className="text-2xl font-bold">{finalScore}%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Recommendation:</span>
              <div className="text-lg uppercase font-bold">
                {recommendation}
              </div>
            </div>
            <Button className="w-1/2 sm:w-auto" variant="outline">
              <CiExport />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Competency Ratings</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competency</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Manager</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xmd">
              {competencies.map((item) => (
                <TableRow key={item.competencyId}>
                  <TableCell className="py-4">{item.competencyName}</TableCell>
                  <TableCell>{item.expectedLevelName}</TableCell>
                  <TableCell>{item.employeeLevelName}</TableCell>
                  <TableCell>{item.managerLevelName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {finalNote && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Final Note</h3>
            <RenderHtml html={finalNote ?? ""} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedAppraisalResult;
