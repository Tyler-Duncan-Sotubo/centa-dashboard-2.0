// _components/InterviewDetails.tsx

import React, { useState } from "react";
import { format } from "date-fns";
import { ApplicationDetails } from "@/types/application";
import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import { ScheduleInterviewModal } from "../../interviews/_components/ScheduleInterviewModal";

const InterviewDetails = ({
  data,
}: {
  data: ApplicationDetails | undefined;
}) => {
  const [showModal, setShowModal] = useState(false);
  if (!data?.interview) return null;

  interface InfoRowProps {
    label: string;
    value: React.ReactNode;
  }

  const InfoRow = ({ label, value }: InfoRowProps) => (
    <div className="space-y-1 capitalize">
      <p className="text-md text-muted-foreground">{label}</p>
      <p className="text-lg font-medium break-words">{value}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Interview Details"
        description="View the details of the interview scheduled for this candidate."
      >
        {data.interview.eventId && (
          <Button onClick={() => setShowModal(true)}>
            Reschedule Interview
          </Button>
        )}
      </PageHeader>
      <div className="grid sm:grid-cols-2 gap-4">
        <InfoRow label="Stage" value={data.interview.stage} />
        <InfoRow
          label="Scheduled For"
          value={format(new Date(data.interview.scheduledFor), "PPPpp")}
        />
        <InfoRow
          label="Duration"
          value={`${data.interview.durationMins} minutes`}
        />
        <InfoRow label="Status" value={data.interview.status} />
        <InfoRow label="Mode" value={data.interview.mode} />
        {data.interview.meetingLink && (
          <InfoRow
            label="Meeting Link"
            value={
              <a
                href={data.interview.meetingLink}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {data.interview.meetingLink}
              </a>
            }
          />
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold">Interviewers</h3>
        <ul className="list-disc list-inside">
          {data.interview.interviewers.map((int) => (
            <li key={int.id}>
              {int.name} ({int.email})
            </li>
          ))}
        </ul>
      </div>

      <ScheduleInterviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        applicationId={data.application.id}
        candidateEmail={data.candidate.email || ""}
        stage={"onsite"}
        eventId={data.interview.eventId} // Pass event ID for rescheduling
        interviewId={data.interview.id} // Pass interview ID for rescheduling
      />
    </div>
  );
};

export default InterviewDetails;
