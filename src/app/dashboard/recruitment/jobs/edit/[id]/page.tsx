"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EmploymentType, JobType } from "@/types/enums";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FileText, ClipboardList, CheckCircle, Check } from "lucide-react"; // Lucide icons
import { isAxiosError } from "@/lib/axios";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FormError from "@/shared/ui/form-error";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { FaChevronCircleLeft } from "react-icons/fa";
import Link from "next/link";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import JobDetailsForm from "../../_components/JobDetailsForm";
import JobApplicationFormConfig from "../../_components/JobApplicationFormConfig";
import JobPreview from "../../_components/JobPreview";

const formSchema = z.object({
  title: z.string().min(1),
  pipelineTemplateId: z.string().uuid().min(1, "Pipeline template is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  city: z.string().optional(),
  jobType: z.nativeEnum(JobType),
  employmentType: z.nativeEnum(EmploymentType),
  salaryRangeFrom: z.string().min(1, "Salary range from is required"),
  salaryRangeTo: z.string().min(1, "Salary range to is required"),
  currency: z.string().min(1, "Currency is required"),
  experienceLevel: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  qualification: z.string().optional(),
  description: z.string().min(1, "Job description is required"),
  benefits: z.array(
    z.object({
      value: z.string().min(1, "Stage name is required"),
    }),
  ),
  responsibilities: z
    .array(
      z.object({
        value: z.string().min(1, "Stage name is required"),
      }),
    )
    .min(1, "At least one stage is required")
    .max(20, "Maximum 20 stages allowed"),
  requirements: z
    .array(
      z.object({
        value: z.string().min(1, "Stage name is required"),
      }),
    )
    .min(1, "At least one stage is required")
    .max(20, "Maximum 20 stages allowed"),
  deadlineDate: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const EditJobPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const axiosInstance = useAxiosAuth();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [category, setCategory] = useState<string>("engineering");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      jobType: JobType.OnSite,
      employmentType: EmploymentType.FullTime,
      description: "",
    },
  });

  const { control, register, trigger } = form;

  const {
    fields: resFields,
    append: addRes,
    remove: removeRes,
  } = useFieldArray({
    control,
    name: "responsibilities",
  });

  const {
    fields: reqFields,
    append: addReq,
    remove: removeReq,
  } = useFieldArray({
    control,
    name: "requirements",
  });

  const {
    fields: benefitsFields,
    append: addBenefit,
    remove: removeBenefit,
  } = useFieldArray({
    control,
    name: "benefits",
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];

    if (step === 1)
      fieldsToValidate = [
        "title",
        "jobType",
        "description",
        "responsibilities",
        "requirements",
        "pipelineTemplateId",
        "currency",
        "salaryRangeFrom",
        "salaryRangeTo",
        "country",
        "state",
        "city",
        "employmentType",
        "experienceLevel",
      ];
    if (step === 2) fieldsToValidate = [];
    if (step === 3) fieldsToValidate = [];

    const valid = await trigger(fieldsToValidate);
    if (valid) {
      setStep((prev) => prev + 1);
    }
  };

  const steps = [
    { label: "Job Details", icon: FileText },
    { label: "Application Form", icon: ClipboardList },
    { label: "Finalize", icon: CheckCircle },
  ];

  const draftJobs = useUpdateMutation({
    endpoint: `/api/jobs/${id}`,
    successMessage: "Job updated successfully",
    refetchKey: "jobs",
    onSuccess: () => {
      setError("");
    },
  });

  const publishJob = useUpdateMutation({
    endpoint: `/api/jobs/${id}/publish`,
    successMessage: "Job published successfully",
    refetchKey: "jobs",
    onSuccess: () => {
      router.push("/dashboard/recruitment/jobs");
    },
  });

  const fetchPipelineTemplates = async () => {
    try {
      const res = await axiosInstance.get("/api/pipeline/templates");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const fetchJobById = async () => {
    const res = await axiosInstance.get(`/api/jobs/${id}`);
    return res.data.data;
  };

  const {
    data: templates,
    isLoading: isTemplatesLoading,
    isError,
  } = useQuery({
    queryKey: ["pipelineTemplates"],
    queryFn: () => fetchPipelineTemplates(),
    enabled: Boolean(session?.backendTokens?.accessToken),
    retry: 2,
  });

  const {
    data: jobData,
    isLoading: isJobLoading,
    isError: isJobError,
  } = useQuery({
    queryKey: ["job", id],
    queryFn: fetchJobById,
    enabled: Boolean(session?.backendTokens?.accessToken),
    retry: 2,
  });

  useEffect(() => {
    if (jobData) {
      form.reset({
        ...jobData,
        responsibilities:
          jobData.responsibilities?.map((r: string) => ({ value: r })) || [],
        requirements:
          jobData.requirements?.map((r: string) => ({ value: r })) || [],
        benefits: jobData.benefits?.map((b: string) => ({ value: b })) || [],
        salaryRangeFrom: String(jobData.salaryRangeFrom),
        salaryRangeTo: String(jobData.salaryRangeTo),
        currency: jobData.currency || "NGN",
      });
    }
  }, [form, jobData]);

  if (status === "loading" || isTemplatesLoading || isJobLoading)
    return <Loading />;
  if (isError || isJobError) return <p>Error loading data</p>;

  return (
    <div className="max-w-5xl p-5">
      <Link href="/dashboard/recruitment/jobs">
        <Button variant={"link"} className="px-0 text-md mb-5 ">
          <FaChevronCircleLeft size={30} />
          Back to Jobs
        </Button>
      </Link>
      <div className="relative flex justify-between mb-10 max-w-2xl">
        <div className="absolute top-5 left-0 w-full h-2 bg-gray-300 z-0 rounded"></div>
        <div
          className="absolute top-5 left-0 h-2 bg-brand z-10 rounded transition-all duration-500"
          style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((item, index) => {
          const Icon = item.icon;
          const isCompleted = index < step - 1;
          const isActive = index === step - 1;
          return (
            <div
              key={index}
              className="relative z-20 flex flex-col items-center w-1/3"
            >
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center 
                  ${
                    isCompleted
                      ? "bg-brand text-white border-brand"
                      : isActive
                        ? "bg-white border-brand text-brand"
                        : "bg-white border-gray-300 text-gray-400"
                  }`}
              >
                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
              </div>
              <span
                className={`mt-2 text-sm ${
                  isActive || isCompleted ? "text-black" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <Form {...form}>
        <form>
          {step === 1 && (
            <JobDetailsForm
              form={form}
              control={control}
              resFields={resFields}
              addRes={addRes}
              removeRes={removeRes}
              reqFields={reqFields}
              addReq={addReq}
              removeReq={removeReq}
              register={register}
              templates={templates}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              category={category}
              setCategory={setCategory}
              benefitsFields={benefitsFields}
              addBenefit={addBenefit}
              removeBenefit={removeBenefit}
            />
          )}

          {step === 2 && (
            <JobApplicationFormConfig
              previewOpen={previewOpen}
              setPreviewOpen={setPreviewOpen}
              jobId={id!}
              setStep={setStep}
            />
          )}
          {step === 3 && (
            <>
              <JobPreview jobId={id!} />
            </>
          )}

          {error && <FormError message={error} />}

          <div className="flex justify-between pt-4">
            {(step === 0 || step === 1) && (
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const isValid = await form.trigger(); // validate current form values

                  if (!isValid) {
                    return;
                  }

                  const draftData = form.getValues();

                  if (!draftData.pipelineTemplateId) {
                    setError(
                      "Please select a pipeline template before saving draft.",
                    );
                    return;
                  }

                  const formattedData = {
                    ...draftData,
                    salaryRangeFrom: Number(draftData.salaryRangeFrom),
                    salaryRangeTo: Number(draftData.salaryRangeTo),
                    responsibilities: draftData.responsibilities.map(
                      (r) => r.value,
                    ),
                    requirements: draftData.requirements.map((r) => r.value),
                    benefits: draftData.benefits.map((b) => b.value),
                  };

                  await draftJobs({ ...formattedData }, setError);
                }}
              >
                Save Draft
              </Button>
            )}

            {/* Only render “Continue” if on step 1 and jobId exists */}
            {step === 1 && (
              <Button
                type="button"
                onClick={async () => {
                  await nextStep();
                }}
              >
                Continue
              </Button>
            )}

            {/* Optionally, show no button at all for step 2, or provide other controls */}
            {step === 3 && (
              <>
                <Button
                  type="button"
                  className="w-44"
                  onClick={async () => {
                    if (!id) {
                      setError("Please save the job as a draft first.");
                      return;
                    }
                    await publishJob();
                  }}
                >
                  Post Job
                </Button>
                <Button type="button" className="w-44" variant={"outline"}>
                  Edit Job
                </Button>
              </>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditJobPage;
