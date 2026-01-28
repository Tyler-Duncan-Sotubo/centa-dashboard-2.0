"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { FaGlobe, FaBuilding, FaPlus, FaEye } from "react-icons/fa";
import PageHeader from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import CreatePipelineTemplateModal from "@/app/dashboard/recruitment/jobs/_components/CreatePipelineTemplateModal";

interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  isGlobal: boolean;
  createdAt: string;
  stageCount: number;
}

export default function PipelineTemplateList({
  templates,
}: {
  templates: PipelineTemplate[];
}) {
  const { data: session } = useSession();
  const [selected, setSelected] = useState<PipelineTemplate | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const axiosInstance = useAxiosAuth();

  const { data: stages, isLoading: loadingStages } = useQuery({
    queryKey: ["template-stages", selected?.id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/pipeline/template/${selected?.id}`,
      );
      return res.data.data.stages; // Adjust based on your API response shape
    },
    enabled: !!selected?.id && Boolean(session?.backendTokens?.accessToken),
  });

  return (
    <section>
      <PageHeader
        title="Pipeline Templates"
        description="Manage your hiring pipeline templates. Create, edit, or delete templates to streamline your hiring process."
      >
        <Button onClick={() => setIsOpen(true)}>
          <FaPlus className="mr-2" />
          Create New Template
        </Button>
      </PageHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        {templates.map((tpl) => (
          <Card key={tpl.id} className="flex flex-col justify-between max-h-48">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-md truncate w-2/3">
                  {tpl.name}
                </CardTitle>
                <Badge variant={tpl.isGlobal ? "approved" : "outline"}>
                  {tpl.isGlobal ? (
                    <FaGlobe className="mr-1" />
                  ) : (
                    <FaBuilding className="mr-1" />
                  )}
                  {tpl.isGlobal ? "Global" : "Company"}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {tpl.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex justify-between items-center pt-4">
              <span className="text-sm text-muted-foreground">
                {tpl.stageCount} {tpl.stageCount === 1 ? "stage" : "stages"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelected(tpl)}
              >
                <FaEye className="mr-2" />
                Preview
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pipeline Preview</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-4">
              <p>
                <strong>Name:</strong> {selected.name}
              </p>
              <p>
                <strong>Description:</strong> {selected.description}
              </p>
              <p>
                <strong>Stages:</strong>
              </p>
              {loadingStages ? (
                <p className="text-muted-foreground">Loading stages...</p>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {stages?.map(
                    (stage: { id: string; name: string }, idx: number) => (
                      <li key={stage.id}>
                        Stage {idx + 1}: {stage.name}
                      </li>
                    ),
                  )}
                </ul>
              )}
              <p>
                <strong>Scope:</strong>{" "}
                {selected.isGlobal ? "Global" : "Company-specific"}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <CreatePipelineTemplateModal open={isOpen} setOpen={setIsOpen} />
    </section>
  );
}
