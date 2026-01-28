"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

type Interview = {
  id: string;
  scheduledFor: string;
  durationMins: number;
  stage: string;
  mode: string;
  meetingLink?: string;
  candidateName?: string;
  scorecardCriteria?: {
    id: string;
    label: string;
    description: string;
    maxScore: number;
  }[];
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview | null;
}

const InterviewDetailsModal = ({ isOpen, onClose, interview }: Props) => {
  if (!interview) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Interview Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-md grid grid-cols-2 gap-4 capitalize mb-6">
            <div>
              <p className="font-medium">Candidate:</p>
              <p>{interview.candidateName || "N/A"}</p>
            </div>

            <div>
              <p className="font-medium">Stage:</p>
              <p>{interview.stage}</p>
            </div>

            <div>
              <p className="font-medium">Mode:</p>
              <p>{interview.mode}</p>
            </div>

            <div>
              <p className="font-medium">Scheduled:</p>
              <p>{format(new Date(interview.scheduledFor), "PPPp")}</p>
            </div>

            <div>
              <p className="font-medium">Duration:</p>
              <p>{interview.durationMins} minutes</p>
            </div>
          </div>

          {interview.meetingLink && (
            <div>
              <p className="font-medium mb-2">Meeting Link:</p>
              <Link
                href={interview.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>Join Meeting</Button>
              </Link>
            </div>
          )}

          {interview.scorecardCriteria &&
            interview.scorecardCriteria.length > 0 && (
              <div>
                <h4 className="font-semibold text-base mb-2">
                  Scorecard Criteria
                </h4>
                <ul className="space-y-2">
                  {interview.scorecardCriteria.map((item) => (
                    <li key={item.id}>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-muted-foreground text-sm">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        Max Score: {item.maxScore}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewDetailsModal;
