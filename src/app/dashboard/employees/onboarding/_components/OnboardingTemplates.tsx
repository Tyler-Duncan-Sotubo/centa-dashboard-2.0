"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { FaClone, FaGlobe } from "react-icons/fa6";

interface TemplateSummary {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "published";
  isGlobal: boolean;
  companyId: string | null;
  createdAt: string;
  fieldCount: number;
  checklistCount: number;
}

interface GlobalTemplate {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "published";
  isGlobal: boolean;
  companyId: string | null;
  createdAt: string;
}

export default function OnboardingTemplates({
  data,
  isLoading,
}: {
  data: {
    templateSummaries: TemplateSummary[] | undefined;
    globalTemplates: GlobalTemplate[] | undefined;
  };
  isLoading: boolean;
}) {
  const cloneTemplate = useCreateMutation({
    endpoint: `/api/onboarding-seeder/clone-seed`,
    successMessage: "Template cloned successfully!",
    refetchKey: "templates",
  });

  const handleClone = async (id: string) => {
    await cloneTemplate({
      templateId: id,
    });
  };

  return (
    <div>
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {(data?.templateSummaries?.length ?? 0) > 0 && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-6">
              <h2 className="text-lg font-semibold col-span-full">
                Your Templates
              </h2>
              {data?.templateSummaries?.map((template) => (
                <Card key={template.id} className="h-full">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h2 className="text-md font-semibold truncate w-1/2">
                        {template.name}
                      </h2>
                      <Badge
                        variant={
                          template.status === "published"
                            ? "approved"
                            : "pending"
                        }
                      >
                        {template.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.description || "No description"}
                    </p>
                    <div className="text-xs text-muted-foreground flex gap-4">
                      <span>{template.fieldCount} fields</span>
                      <span>{template.checklistCount} tasks</span>
                    </div>
                    <div className="flex justify-end">
                      <Link
                        href={`/dashboard/employees/onboarding/templates/${template.id}`}
                      >
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {(data?.globalTemplates?.length ?? 0) > 0 && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-10 mb-20">
              <h2 className="text-lg font-semibold col-span-full">
                Templates You Can Clone
              </h2>
              {data?.globalTemplates?.map((template) => (
                <Card key={template.id} className="h-full">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h2 className="text-md font-semibold truncate">
                        {template.name}
                      </h2>
                      <Badge variant="completed">
                        <FaGlobe className="mr-1" />
                        Global
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.description || "No description"}
                    </p>
                    <div className="text-xs text-muted-foreground italic">
                      Clone-ready
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleClone(template.id);
                        }}
                      >
                        <FaClone />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
