"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { FaCirclePlus, FaClone, FaGlobe } from "react-icons/fa6";
import Loading from "@/shared/ui/loading";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { TemplatesResponse } from "@/types/onboarding/onboarding.type";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/shared/ui/page-header";
import { SendOnboardingInviteSheet } from "../onboarding/_components/SendOnboardingInviteSheet";

export default function OnboardingTemplates() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchTemplates = async (): Promise<TemplatesResponse> => {
    try {
      const res = await axiosInstance.get("/api/onboarding-seeder/templates");
      return res.data.data as TemplatesResponse;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return { templateSummaries: [], globalTemplates: [] };
      }
      // Always return a TemplatesResponse fallback
      return { templateSummaries: [], globalTemplates: [] };
    }
  };

  const { data, isLoading, isError } = useQuery<TemplatesResponse>({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

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

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <div className="px-4">
      <PageHeader
        title="Onboarding Templates"
        description="Manage your onboarding templates for new employees."
      >
        <Link href="/dashboard/employees/onboarding-templates/create">
          <Button className="gap-2">
            <FaCirclePlus className="w-4 h-4" /> New Template
          </Button>
        </Link>
        <SendOnboardingInviteSheet />
      </PageHeader>
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {(data?.templateSummaries?.length ?? 0) > 0 && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-10">
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
                        href={`/dashboard/employees/onboarding-templates/${template.id}`}
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
