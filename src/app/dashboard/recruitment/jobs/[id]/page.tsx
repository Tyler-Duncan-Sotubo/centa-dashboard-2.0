"use client";

import { use, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import JobPipelineBoard from "../_components/JobPipelineBoard";
import { MdPeople, MdDescription } from "react-icons/md";
import { FaChevronCircleLeft, FaEdit } from "react-icons/fa";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import JobPreview from "../_components/JobPreview";
import { FaPlus } from "react-icons/fa6";
import { PiKanban, PiListDashesBold } from "react-icons/pi";
import JobListView from "../_components/JobListView";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function JobPipelinePage({ params }: PageProps) {
  const { id } = use(params);
  const [tab, setTab] = useState("candidates");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  return (
    <section className="w-full p-5 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Link href="/dashboard/recruitment/jobs">
          <Button variant="link" className="px-0 text-md">
            <FaChevronCircleLeft size={30} />
            Back to Jobs List
          </Button>
        </Link>

        {tab === "candidates" ? (
          <Link href={`/dashboard/recruitment/jobs/apply/${id}`}>
            <Button>
              <FaPlus />
              Add Candidate
            </Button>
          </Link>
        ) : (
          <Link href={`/dashboard/recruitment/jobs/edit/${id}`}>
            <Button>
              <FaEdit />
              Edit Job
            </Button>
          </Link>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="h-full">
        <TabsList className="flex justify-between items-center w-full">
          <div className="flex items-center gap-10">
            <TabsTrigger
              value="candidates"
              className="flex items-center gap-2"
              icon={<MdPeople size={18} />}
            >
              Candidates
            </TabsTrigger>
            <TabsTrigger
              value="description"
              className="flex items-center gap-2"
              icon={<MdDescription size={18} />}
            >
              Job Details
            </TabsTrigger>
          </div>

          {tab === "candidates" && (
            <div className="flex space-x-2 border-b border-muted mb-2">
              <Button
                onClick={() => setViewMode("kanban")}
                variant="ghost"
                className={`rounded-none p-6 text-sm ${
                  viewMode === "kanban"
                    ? "border-b-2 border-primary text-monzo-brandDark font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <PiKanban />
                Kanban
              </Button>

              <Button
                onClick={() => setViewMode("list")}
                variant="ghost"
                className={`rounded-none px-4 py-2 text-sm ${
                  viewMode === "list"
                    ? "border-b-2 border-primary text-monzo-brandDark font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <PiListDashesBold />
                List
              </Button>
            </div>
          )}
        </TabsList>

        <TabsContent value="description">
          <JobPreview jobId={id} />
        </TabsContent>

        <TabsContent value="candidates">
          {viewMode === "kanban" ? (
            <JobPipelineBoard jobId={id} />
          ) : (
            <JobListView jobId={id} />
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
