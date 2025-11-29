/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateMutation } from "@/hooks/useCreateMutation";

import { AdditionalQuestionsForm } from "./AdditionalQuestionsForm";

type FieldType = {
  id: string;
  section: string;
  label: string;
  fieldType: string;
  isGlobal: boolean;
};

type GroupedFields = Record<string, FieldType[]>;

const REQUIRED_LABELS = [
  "Full Name",
  "Email Address",
  "Phone Number",
  "Resume/CV",
];

type Question = {
  question: string;
  type: string;
  required: boolean;
  options: string[];
};

const JobApplicationFormConfig = ({
  previewOpen,
  setPreviewOpen,
  jobId,
  setStep,
}: {
  previewOpen: boolean;
  setPreviewOpen: (open: boolean) => void;
  jobId: string;
  setStep: (step: number) => void;
}) => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [error, setError] = useState<string>("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [requiredIds, setRequiredIds] = useState<Set<string>>(new Set());
  const [additionalQuestions, setAdditionalQuestions] = useState<Question[]>([
    { question: "", type: "text", required: false, options: [] },
  ]);
  const [style, setStyle] = useState<"resume_only" | "form_only" | "both">(
    "form_only"
  );
  const [publishing, setPublishing] = useState(false);

  const fetchFields = async (): Promise<FieldType[]> => {
    try {
      const res = await axiosInstance.get(
        "/api/jobs/application-form/field-definitions"
      );
      return res.data.data;
    } catch (err) {
      console.error("Error loading fields", err);
      return [];
    }
  };

  const {
    data: fields,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["applicationFormFields"],
    queryFn: fetchFields,
    enabled: !!session?.backendTokens.accessToken,
  });

  useEffect(() => {
    if (fields && fields.length > 0) {
      const required = fields.filter((f) => REQUIRED_LABELS.includes(f.label));
      const requiredMap: Record<string, boolean> = {};
      const requiredIdSet = new Set<string>();

      required.forEach((f) => {
        requiredMap[f.id] = true;
        requiredIdSet.add(f.id);
      });

      setSelected((prev) => ({ ...prev, ...requiredMap }));
      setRequiredIds(requiredIdSet);
    }
  }, [fields]);

  const groupedFields: GroupedFields = (fields ?? []).reduce((acc, field) => {
    if (!acc[field.section]) acc[field.section] = [];
    acc[field.section].push(field);
    return acc;
  }, {} as GroupedFields);

  const toggleField = (id: string) => {
    if (requiredIds.has(id)) return;
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const createForm = useCreateMutation({
    endpoint: `/api/jobs/${jobId}/application-form`,
    successMessage: "Application form created successfully",
    refetchKey: "applicationFormFields",
    onSuccess: () => {
      setStep(3);
      setError("");
    },
  });

  const handlePublishForm = async () => {
    try {
      setPublishing(true);

      const customFields = fields?.filter((f) => selected[f.id]);
      const customQuestions = additionalQuestions
        .filter((q) => q.question.trim())
        .map((q, index) => ({
          question: q.question.trim(),
          type: q.type,
          required: q.required ?? false,
          order: index,
          options: ["select", "radio", "checkbox"].includes(q.type)
            ? q.options.filter(Boolean)
            : undefined,
        }));

      const payload = {
        config: {
          style,
          includeReferences: false,
          customFields,
          customQuestions,
        },
      };

      await createForm(payload, setError);
    } catch (error) {
      console.error("Failed to publish application form", error);
      alert("Something went wrong while publishing the form.");
    } finally {
      setPublishing(false);
    }
  };

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <div className="space-y-8">
      {/* Style Selector */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Application Method</h3>
        <RadioGroup value={style} onValueChange={(val) => setStyle(val as any)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="resume_only" id="resume_only" />
            <label htmlFor="resume_only">Resume Only</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="form_only" id="form_only" />
            <label htmlFor="form_only">Form Only</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="both" id="both" />
            <label htmlFor="both">Both</label>
          </div>
        </RadioGroup>
      </div>

      {Object.entries(groupedFields).map(([section, sectionFields]) => (
        <div key={section}>
          <h3 className="text-lg font-semibold capitalize my-4">{section}</h3>
          <div className="grid grid-cols-3 gap-3">
            {sectionFields.map((field) => (
              <Card
                key={field.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-medium">{field.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {field.fieldType}
                  </p>
                </div>
                <Checkbox
                  checked={!!selected[field.id]}
                  disabled={requiredIds.has(field.id)}
                  onCheckedChange={() => toggleField(field.id)}
                />
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Additional Questions */}

      <AdditionalQuestionsForm
        questions={additionalQuestions}
        setQuestions={setAdditionalQuestions}
        error={error}
      />

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Form Preview</DialogTitle>
            <DialogDescription>
              This is how applicants will see the form.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {fields
              ?.filter((f) => selected[f.id])
              .map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label>{field.label}</Label>
                  {field.fieldType === "text" && (
                    <Input placeholder={`Enter ${field.label}`} disabled />
                  )}
                  {field.fieldType === "textarea" && (
                    <Textarea placeholder={`Enter ${field.label}`} disabled />
                  )}
                  {field.fieldType === "select" && (
                    <select
                      disabled
                      className="w-full border rounded px-2 py-1"
                    >
                      <option>{`Select ${field.label}`}</option>
                    </select>
                  )}
                  {field.fieldType === "date" && <Input type="date" disabled />}
                  {field.fieldType === "file" && <Input type="file" disabled />}
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-x-4">
        <Button type="button" onClick={() => setPreviewOpen(true)}>
          Preview Form
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handlePublishForm}
          isLoading={publishing}
        >
          Publish Form
        </Button>
      </div>
    </div>
  );
};

export default JobApplicationFormConfig;
