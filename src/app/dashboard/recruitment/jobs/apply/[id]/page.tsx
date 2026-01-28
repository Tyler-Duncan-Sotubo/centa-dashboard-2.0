/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { ApplicationForm } from "../../_components/ApplicationForm";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import { FaChevronCircleLeft } from "react-icons/fa";

interface PageProps {
  params: {
    id: string;
  };
}

export default function ApplyPage({ params }: PageProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const axiosInstance = useAxiosAuth();
  const { data: session, status } = useSession();

  const submitApplication = useCreateMutation({
    endpoint: "api/applications/submit",
    successMessage: "Application submitted successfully",
    onSuccess: () => {
      setError(null);
      router.push(`/dashboard/recruitment/jobs/${params.id}`);
    },
  });

  const fetchForm = async () => {
    try {
      const res = await axiosInstance.get(
        `/api/jobs/${params.id}/application-form`,
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["application-form", params.id],
    queryFn: () => fetchForm(),
    enabled: Boolean(session?.backendTokens?.accessToken),
    refetchOnMount: true,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  function mapFormToDto({
    values,
    fields,
    questions,
    jobId,
    applicationSource,
    candidateSource,
  }: {
    values: Record<string, any>;
    fields: any[];
    questions: any[];
    jobId: string;
    applicationSource: string;
    candidateSource: string;
  }) {
    const fieldResponses = fields.map((field) => {
      const rawValue = values[field.id];

      const value =
        field.fieldType === "file"
          ? (rawValue?.base64 ?? "") // ✅ send only base64
          : String(rawValue ?? "");

      return {
        label: field.label,
        fieldType: field.fieldType,
        value,
      };
    });

    const questionResponses = questions.map((q) => ({
      question: q.question,
      answer: String(values[q.id] ?? ""),
    }));

    return {
      jobId,
      applicationSource,
      candidateSource,
      fieldResponses,
      questionResponses,
    };
  }

  const handleApplicationSubmit = async (values: any) => {
    const dto = mapFormToDto({
      values,
      fields: data.fields,
      questions: data.questions,
      jobId: params.id, // pass from props/context
      applicationSource: "career_page", // or dynamic
      candidateSource: "referral", // or dynamic
    });
    await submitApplication(dto, setError);
  };

  return (
    <div className="max-w-2xl pb-10 p-5 space-y-6">
      <Link href="/dashboard/recruitment/jobs">
        <Button variant={"link"} className="px-0 text-md">
          <FaChevronCircleLeft size={30} />
          Back to Jobs
        </Button>
      </Link>
      <PageHeader
        title="Apply for Job"
        description="Fill out the application form to apply for this job."
      />

      <ApplicationForm
        data={data}
        onSubmit={handleApplicationSubmit}
        error={error}
      />
    </div>
  );
}
