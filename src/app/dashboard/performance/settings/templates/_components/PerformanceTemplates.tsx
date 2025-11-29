"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import Loading from "@/components/ui/loading";
import ReviewTemplateTable from "./ReviewTemplateTable";
import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import { FaCirclePlus } from "react-icons/fa6";
import { useState } from "react";
import ReviewTemplateModal from "./ReviewTemplateModal";

export type ReviewTemplate = {
  id: string;
  companyId: string;
  name: string;
  description: string;
  isDefault: boolean;
  includeGoals: boolean;
  includeAttendance: boolean;
  includeFeedback: boolean;
  includeQuestionnaire: boolean;
  requireSignature: boolean;
  restrictVisibility: boolean;
  createdAt: string;
};

export default function PerformanceTemplates() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const [open, setOpen] = useState(false);

  const fetchTemplates = async (): Promise<ReviewTemplate[]> => {
    try {
      const res = await axios.get("/api/templates");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error("Failed to fetch templates", error.response?.data);
      }
      return [];
    }
  };

  const {
    data: templates,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
    enabled: !!session?.backendTokens.accessToken,
  });

  if (isLoading) return <Loading />;
  if (isError || !templates) return <p>Error loading templates</p>;

  return (
    <section>
      <PageHeader
        title="Performance Templates"
        description="Manage performance review templates for your organization."
      >
        <Button onClick={() => setOpen(true)}>
          <FaCirclePlus className="mr-2" /> New Template
        </Button>
      </PageHeader>
      <ReviewTemplateTable templates={templates} />
      <ReviewTemplateModal open={open} setOpen={setOpen} />
    </section>
  );
}
