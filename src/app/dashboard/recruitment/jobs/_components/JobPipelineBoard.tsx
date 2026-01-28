"use client";

import { useQuery } from "@tanstack/react-query";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import Loading from "@/shared/ui/loading";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { Separator } from "@/shared/ui/separator";
import { formatSource } from "@/shared/utils/formatSource";
import { Button } from "@/shared/ui/button";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { formatDateHumanReadable } from "@/shared/utils/formatDateHumanReadable";
import Link from "next/link";

import dynamic from "next/dynamic";
import { TemplateSelectionModal } from "../../offers/_components/TemplateSelectionModal";

const ScheduleInterviewModal = dynamic(
  () => import("../_components/ScheduleInterviewModalClient"),
  { ssr: false },
);

interface resumeScore {
  score: number;
  strengths: string[];
  weaknesses: string[];
}

type Application = {
  applicationId: string;
  fullName: string;
  email?: string;
  appSource?: string; // Added appSource field
  appliedAt: string;
  resumeScore?: resumeScore;
};

type Stage = {
  stageId: string;
  stageName: string;
  applications: Application[];
};

type DragItem = {
  application: Application;
  fromStageId: string;
};

const ItemType = "APPLICATION";

const STAGE_COLORS = [
  "#00626F68", // brand
  "#4D70F968", // success
  "#4BB78F68", // monzoGreen
  "#F1BD7668", // monzoOrange
  "#04785768", // success
];

const getStageColor = (stageId: string, index: number) => {
  return STAGE_COLORS[index % STAGE_COLORS.length];
};

// Draggable application card
const DraggableCard = ({
  application,
  fromStageId,
}: {
  application: Application;
  fromStageId: string;
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { application, fromStageId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const dragRef = useCallback(
    (el: HTMLDivElement | null) => {
      drag(el);
    },
    [drag],
  );

  return (
    <div
      ref={dragRef}
      className={cn(
        "p-2 bg-white rounded-md shadow-xs my-6 border space-y-4 hover:cursor-move",
        {
          "opacity-50": isDragging,
        },
      )}
    >
      <div className="flex justify-between items-center gap-2">
        <div>
          <p className="font-semibold text-md">{application.fullName}</p>
          <p className="text-sm text-muted-foreground">{application.email}</p>
        </div>
        <Link
          href={`/dashboard/recruitment/candidates/${application.applicationId}`}
        >
          <Button variant={"secondary"} className="ml-auto h-8 p-3 text-xs">
            View
          </Button>
        </Link>
      </div>
      <div>
        {application.resumeScore && (
          <div className="flex flex-col">
            <p className="text-sm">Resume Score</p>
            <p className="text-md font-semibold">
              {application.resumeScore.score}%
            </p>
          </div>
        )}
      </div>
      <Separator className="my-3" />
      <div className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Applied: {formatDateHumanReadable(new Date(application.appliedAt))}
        </p>
        <p className="text-xs text-muted-foreground">
          Source: {formatSource(application.appSource || "unknown")}
        </p>
      </div>
    </div>
  );
};

// Droppable stage column
const DroppableStage = ({
  stage,
  onDrop,
  index,
}: {
  stage: Stage;
  onDrop: (item: DragItem, toStageId: string) => void;
  index: number;
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType,
    drop: (item: DragItem) => onDrop(item, stage.stageId),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const dropRef = useCallback(
    (node: HTMLTableCellElement | null) => {
      drop(node);
    },
    [drop],
  );

  return (
    <div
      ref={dropRef}
      className={cn("min-w-72 rounded min-h-[300px]", {
        "bg-blue-100": isOver,
      })}
    >
      <div
        className={`mb-2 flex justify-between items-center p-2  ${
          isOver ? "bg-blue-50" : "bg-white"
        }`}
        style={{
          backgroundColor: `${
            stage.stageName === "Rejected"
              ? "#F8717168"
              : getStageColor(stage.stageId, index)
          }`,
        }}
      >
        <h3 className="text-md font-bold">{stage.stageName}</h3>
        <Badge
          variant="ongoing"
          className="text-white border-none"
          style={{
            backgroundColor:
              stage.stageName === "Rejected"
                ? "#F87171"
                : getStageColor(stage.stageId, index),
          }}
        >
          {stage.applications.length}
        </Badge>
      </div>
      {stage.applications.map((app) => (
        <DraggableCard
          key={app.applicationId}
          application={app}
          fromStageId={stage.stageId}
        />
      ))}
    </div>
  );
};

// Main pipeline board component
const JobPipelineBoard = ({ jobId }: { jobId: string }) => {
  const axiosInstance = useAxiosAuth();
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [showOfferTemplateModal, setShowOfferTemplateModal] = useState(false);

  const { data: stages, isLoading } = useQuery<Stage[]>({
    queryKey: ["pipeline", jobId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/applications/list/${jobId}`);
      return res.data.data;
    },
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  const movingApplication = useUpdateMutation({
    endpoint: "/api/applications/move-stage",
    successMessage: "Application moved successfully",
    refetchKey: "pipeline",
  });

  const handleDrop = (item: DragItem, toStageId: string) => {
    const toStage = stages?.find((s) => s.stageId === toStageId);

    const { application, fromStageId } = item;
    if (fromStageId === toStageId) return;

    if (toStage?.stageName.toLowerCase().includes("interview")) {
      setSelectedApplication(application);
      setSelectedStage(toStageId);
      setShowModal(true);
      return; // Wait for modal action before moving
    }

    if (toStage?.stageName.toLowerCase().includes("offer")) {
      setSelectedApplication(application);
      setShowOfferTemplateModal(true);
      setSelectedStage(toStageId);
      return;
    }

    movingApplication({
      applicationId: application.applicationId,
      newStageId: toStageId,
    });
  };

  if (isLoading || !stages) return <Loading />;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-[calc(100vh-9vh-189px)]">
        {/* This fills the remaining vertical space */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex items-start gap-4 h-full">
            {stages.map((stage, index) => (
              <DroppableStage
                key={stage.stageId}
                stage={stage}
                index={index}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedApplication && selectedStage && (
        <ScheduleInterviewModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            // Move application after scheduling
            movingApplication({
              applicationId: selectedApplication.applicationId,
              newStageId: selectedStage,
            });
            setShowModal(false);
          }}
          applicationId={selectedApplication.applicationId}
          candidateEmail={selectedApplication.email || ""}
          stage={
            (() => {
              const label = stages
                .find((s) => s.stageId === selectedStage)
                ?.stageName.toLowerCase();
              if (label?.includes("phone")) return "phone_screen";
              if (label?.includes("tech")) return "tech";
              if (label?.includes("onsite")) return "onsite";
              return "final";
            })() as "phone_screen" | "tech" | "onsite" | "final"
          }
        />
      )}

      {selectedApplication && (
        <TemplateSelectionModal
          isOpen={showOfferTemplateModal}
          onClose={() => setShowOfferTemplateModal(false)}
          applicationId={selectedApplication.applicationId}
          newStageId={selectedStage ?? ""}
        />
      )}
    </DndProvider>
  );
};

export default JobPipelineBoard;
