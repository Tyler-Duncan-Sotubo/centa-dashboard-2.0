"use client";

import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import { formatDate } from "date-fns";
import { useSession } from "next-auth/react";
import { Separator } from "@/shared/ui/separator";
import { formatSource } from "@/shared/utils/formatSource";
import { formatCurrencyRange } from "@/shared/utils/formatCurrency";

interface JobDetailItemProps {
  label: string;
  value: string | React.ReactNode;
}

const JobDetailItem = ({ label, value }: JobDetailItemProps) => (
  <div>
    <h3 className="text-sm text-muted-foreground font-medium">{label}</h3>
    <p className="text-md font-medium capitalize">{value}</p>
    <Separator className="mt-3" />
  </div>
);

const JobPreview = ({ jobId }: { jobId: string }) => {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchJobDetails = async () => {
    const res = await axiosInstance.get(`/api/jobs/${jobId}`);
    return res.data.data;
  };

  const {
    data: job,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["jobPreview", jobId],
    queryFn: fetchJobDetails,
    enabled: !!jobId && Boolean(session?.backendTokens?.accessToken),
  });

  if (isLoading) return <Loading />;
  if (isError) return <p>Failed to load job details</p>;

  return (
    <div className="grid grid-cols-3 text-lg my-8 gap-10 items-start ">
      <section className="col-span-2 space-y-4">
        <h2 className="text-2xl font-bold">{job?.title}</h2>
        <div>
          <h3 className="font-semibold">Description</h3>
          <p>{job?.description}</p>
        </div>

        <div>
          <h3 className="font-semibold">Responsibilities</h3>
          <ul className="list-disc pl-5">
            {job?.responsibilities.map((r: string, idx: number) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Requirements</h3>
          <ul className="list-disc pl-5">
            {job?.requirements.map((r: string, idx: number) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Benefits</h3>
          <ul className="list-disc pl-5">
            {job?.benefits.map((r: string, idx: number) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="space-y-6 bg-gray-50 shadow-2xs p-6 rounded-md">
        <JobDetailItem
          label="Location"
          value={`${job?.city}, ${job?.state}, ${job?.country}`}
        />

        <JobDetailItem
          label="Type"
          value={`${job?.jobType}, ${
            job?.employmentType ? formatSource(job?.employmentType) : "N/A"
          }`}
        />

        <JobDetailItem
          label="Salary"
          value={`${formatCurrencyRange(
            job?.salaryRangeFrom,
            job?.currency,
          )} - ${formatCurrencyRange(job?.salaryRangeTo, job?.currency)}`}
        />

        <JobDetailItem
          label="Experience"
          value={`${job?.yearsOfExperience} years`}
        />

        <JobDetailItem
          label="Application Deadline"
          value={
            job?.deadlineDate
              ? formatDate(new Date(job?.deadlineDate), "PPP")
              : ""
          }
        />
      </section>

      {/* Add pipeline or application form preview here if needed */}
    </div>
  );
};

export default JobPreview;
