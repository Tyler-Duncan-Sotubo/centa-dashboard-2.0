"use client";

import React, { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import CreatePipelineTemplateModal from "./CreatePipelineTemplateModal";
import { useSession } from "next-auth/react";

// Types
export type PipelineTemplate = {
  id: string;
  name: string;
  description: string;
  isGlobal: boolean;
  createdAt: string;
  stageCount: number;
};

export type Stage = {
  id: string;
  name: string;
  order: number;
};

interface PipelineTemplateSelectorProps {
  value: string | undefined;
  onChange: (templateId: string) => void;
  templates: PipelineTemplate[];
}

export const PipelineTemplateSelector: React.FC<
  PipelineTemplateSelectorProps
> = ({ value, onChange, templates }) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const axiosInstance = useAxiosAuth();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  const fetchStages = async (templateId: string): Promise<Stage[]> => {
    const res = await axiosInstance.get(`/api/pipeline/template/${templateId}`);
    return res.data.data.stages;
  };

  const { data: stages = [], isFetching: loadingStages } = useQuery<Stage[]>({
    queryKey: ["stages", selectedTemplateId],
    queryFn: () => fetchStages(selectedTemplateId!),
    enabled: !!selectedTemplateId && !!session?.backendTokens.accessToken,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-md font-medium">Pipeline Template</p>
        <Button
          variant="link"
          type="button"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="text-sm"
        >
          Create New Template
        </Button>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a pipeline template" />
        </SelectTrigger>
        <SelectContent>
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="flex items-center justify-between px-2 py-1"
            >
              <SelectItem value={tpl.id}>{tpl.name}</SelectItem>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplateId(tpl.id);
                    }}
                  >
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{tpl.name} Pipeline</DialogTitle>
                    <DialogDescription>{tpl.description}</DialogDescription>
                    <p className="text-md">
                      This pipeline template has{" "}
                      <strong>{tpl.stageCount}</strong> stages.
                    </p>
                  </DialogHeader>
                  {loadingStages ? (
                    <p className="text-sm text-muted-foreground">
                      Loading stages...
                    </p>
                  ) : (
                    <ul className="mt-4 list-disc pl-5 space-y-1 text-md">
                      {stages.map((stage) => (
                        <li key={stage.id}>{stage.name}</li>
                      ))}
                    </ul>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </SelectContent>
      </Select>
      <CreatePipelineTemplateModal open={isOpen} setOpen={setIsOpen} />
    </div>
  );
};
