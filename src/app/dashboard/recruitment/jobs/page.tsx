"use client";

import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { Job } from "@/types/jobs.type";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { MdWork } from "react-icons/md";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatSource } from "@/utils/formatSource";
import { Search } from "lucide-react";
import EmptyState from "@/components/empty-state";
import { FaPlug } from "react-icons/fa6";

const JobListingPage = () => {
  const axiosInstance = useAxiosAuth();
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchJobs = async () => {
    try {
      const res = await axiosInstance.get("/api/jobs");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: jobs,
    isLoading,
    isError,
  } = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: () => fetchJobs(),
    enabled: !!session?.backendTokens.accessToken,
    refetchOnMount: true,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <section className="flex flex-col p-5">
      <PageHeader
        title="Jobs"
        description="Manage your jobs and recruitment process"
        icon={<MdWork size={24} />}
      >
        <Link
          href={"/dashboard/integrations"}
          className="flex items-center gap-2 text-textPrimary hover:text-brand"
        >
          <Button
            variant={"clean"}
            className="flex items-center gap-2 px-10 font-bold"
          >
            <FaPlug /> Integrate
          </Button>
        </Link>
        <Link href="/dashboard/recruitment/jobs/create">
          <Button>
            <FaPlus />
            Create New Job
          </Button>
        </Link>
      </PageHeader>

      {jobs?.length === 0 ? (
        <div className="mt-20">
          <EmptyState
            title="No Jobs Found"
            description="You don’t have any jobs yet. Once jobs are created, they’ll appear here."
            image={
              "https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585356/job_ruuqp1.svg"
            } // or "/images/empty-jobs.png" from public folder
            actionLabel="Create New Job"
            actionHref="/dashboard/recruitment/jobs/create"
          />
        </div>
      ) : (
        <section>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-10">
            <p className="text-muted-foreground text-md">
              Total Jobs:{" "}
              <span className="font-medium">{jobs?.length ?? 0}</span>
            </p>
            <div className="w-full md:w-80">
              <Input
                type="text"
                placeholder="Search by title or job type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                leftIcon={<Search size={18} />}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 my-5">
            {jobs
              ?.filter(
                (job) =>
                  job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  job.jobType.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((job: Job) => {
                const isDraft = job.status === "draft";

                const JobCardContent = (
                  <Card className="flex flex-col justify-between h-full">
                    <CardHeader>
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <p className="text-gray-500 text-sm">Active Until:</p>
                          <p className="font-semibold text-sm ml-1">
                            {job.deadlineDate
                              ? formatDate(new Date(job.deadlineDate), "PPP")
                              : "Date not available"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            job.status === "open"
                              ? "approved"
                              : job.status === "draft"
                              ? "pending"
                              : job.status === "closed"
                              ? "rejected"
                              : undefined
                          }
                        >
                          {job.status.charAt(0).toUpperCase() +
                            job.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col justify-between flex-grow">
                      <div className="mb-2">
                        <h3 className="text-lg font-semibold line-clamp-2 min-h-[2rem]">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {job.description}
                        </p>
                      </div>

                      <div className="mt-4 flex justify-between items-end">
                        <div className="flex gap-2">
                          <Badge variant="outline">{job.jobType}</Badge>
                          <Badge variant="outline">
                            {formatSource(job.employmentType)}
                          </Badge>
                        </div>
                        {isDraft && (
                          <Link
                            href={`/dashboard/recruitment/jobs/edit/${job.id}`}
                          >
                            <Button size="sm">Edit</Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );

                return isDraft ? (
                  <div key={job.id}>{JobCardContent}</div> // no link, just card with edit
                ) : (
                  <Link
                    key={job.id}
                    href={`/dashboard/recruitment/jobs/${job.id}`}
                    className="block"
                  >
                    {JobCardContent}
                  </Link>
                );
              })}
          </div>
        </section>
      )}
    </section>
  );
};

export default JobListingPage;
