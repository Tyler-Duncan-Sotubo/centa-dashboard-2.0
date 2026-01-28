"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardContent } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Trash, ChevronDown } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import { Checkbox } from "@/shared/ui/checkbox";
import { Skeleton } from "@/shared/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import PageHeader from "@/shared/ui/page-header";
import Link from "next/link";
import { FaChevronCircleLeft } from "react-icons/fa";
import ChecklistGenerator from "../../_components/ChecklistGenerator";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

interface Field {
  fieldKey: string;
  label: string;
  fieldType: string;
  required: boolean;
  tag: string;
}

interface ChecklistItem {
  title: string;
  assignee: "employee" | "hr";
  dueDaysAfterStart: number;
}

const SYSTEM_FIELDS: Field[] = [
  {
    fieldKey: "dateOfBirth",
    label: "Date of Birth",
    fieldType: "date",
    tag: "profile",
    required: true,
  },
  {
    fieldKey: "gender",
    label: "Gender",
    fieldType: "select",
    tag: "profile",
    required: true,
  },
  {
    fieldKey: "maritalStatus",
    label: "Marital Status",
    fieldType: "select",
    tag: "profile",
    required: true,
  },
  {
    fieldKey: "address",
    label: "Address",
    fieldType: "text",
    tag: "profile",
    required: true,
  },
  {
    fieldKey: "country",
    label: "Country",
    fieldType: "text",
    tag: "profile",
    required: true,
  },
  {
    fieldKey: "phone",
    label: "Phone",
    fieldType: "text",
    tag: "profile",
    required: true,
  },
  {
    fieldKey: "emergencyName",
    label: "Emergency Contact Name",
    fieldType: "text",
    tag: "profile",
    required: true,
  },
  {
    fieldKey: "emergencyPhone",
    label: "Emergency Contact Phone",
    fieldType: "text",
    tag: "profile",
    required: true,
  },
  {
    fieldKey: "bankName",
    label: "Bank Name",
    fieldType: "text",
    tag: "finance",
    required: true,
  },
  {
    fieldKey: "bankAccountNumber",
    label: "Bank Account Number",
    fieldType: "text",
    tag: "finance",
    required: true,
  },
  {
    fieldKey: "bankAccountName",
    label: "Bank Account Name",
    fieldType: "text",
    tag: "finance",
    required: true,
  },
  {
    fieldKey: "bankBranch",
    label: "Bank Branch",
    fieldType: "text",
    tag: "finance",
    required: true,
  },
  {
    fieldKey: "tin",
    label: "Tax Identification Number (TIN)",
    fieldType: "text",
    tag: "finance",
    required: true,
  },
  {
    fieldKey: "pensionPin",
    label: "Pension PIN",
    fieldType: "text",
    tag: "finance",
    required: true,
  },
  {
    fieldKey: "nhfNumber",
    label: "NHF Number",
    fieldType: "text",
    tag: "finance",
    required: true,
  },
  {
    fieldKey: "idUpload",
    label: "Upload Valid Government ID",
    fieldType: "file",
    tag: "document",
    required: true,
  },
];

function DraggableField({
  field,
  index,
  moveField,
  removeField,
}: {
  field: Field;
  index: number;
  moveField: (from: number, to: number) => void;
  removeField: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [, drag] = useDrag({ type: "FIELD", item: { index } });
  const [, drop] = useDrop({
    accept: "FIELD",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveField(item.index, index);
        item.index = index;
      }
    },
  });

  useEffect(() => {
    if (ref.current) drag(drop(ref.current));
  }, [ref, drag, drop]);

  return (
    <div ref={ref} className="cursor-move">
      <Card>
        <CardContent className="space-y-2 p-4 flex items-center justify-between">
          <div>
            <div className="font-medium">{field.label}</div>
            <div className="text-sm capitalize text-muted-foreground">
              {field.fieldType}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={removeField}>
            <Trash className="w-4 h-4 text-red-500" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TemplateEditPage() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const params = useParams();
  const router = useRouter();
  const templateId = params?.id as string;
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const groupedFields = SYSTEM_FIELDS.reduce(
    (acc, field) => {
      if (!acc[field.tag]) acc[field.tag] = [];
      acc[field.tag].push(field);
      return acc;
    },
    {} as Record<string, Field[]>,
  );

  const moveField = (from: number, to: number) => {
    const updated = [...fields];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setFields(updated);
  };

  const {
    data: template,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["template", templateId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/onboarding-seeder/single-template/${templateId}`,
      );
      return res.data.data;
    },
    enabled: !!templateId && Boolean(session?.backendTokens?.accessToken),
  });

  const updateTemplate = useUpdateMutation({
    endpoint: `/api/onboarding-seeder/update-template/${templateId}`,
    successMessage: "Template updated successfully",
    refetchKey: "templates",
    onSuccess: () => {
      router.push("/dashboard/employees/onboarding");
    },
  });

  const handleUpdate = async () => {
    const payload = { name: templateName, description, fields, checklist };
    await updateTemplate(payload);
  };

  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
      setDescription(template.description);
      setFields(template.fields);
      setChecklist(template.checklist);
    }
  }, [template]);

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return <div className="p-6 text-red-500">Error loading template</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="px-5">
        <Link href="/dashboard/employees/onboarding">
          <Button variant={"link"} className="p-0 text-md">
            <FaChevronCircleLeft /> Back to Templates
          </Button>
        </Link>

        {/* Page Header */}
        <PageHeader
          title="Edit Onboarding Template"
          description="Modify the details and fields of this onboarding template."
        />

        {/* Template & Fields */}
        <section className="flex flex-col md:flex-row gap-6 mt-8">
          {/* Left: Template Info & Field Selection */}
          <div className="w-full md:w-[55%] space-y-6">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-base">Select Fields to Include</Label>
              {Object.entries(groupedFields).map(([tag, group]) => (
                <Collapsible
                  key={tag}
                  className="border rounded-md"
                  defaultOpen
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 bg-muted hover:bg-muted/50 transition">
                    <span className="capitalize font-medium">{tag}</span>
                    <ChevronDown className="w-4 h-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {group.map((field) => {
                        const isChecked = fields.some(
                          (f) => f.fieldKey === field.fieldKey,
                        );
                        return (
                          <div
                            key={field.fieldKey}
                            className="flex items-center gap-3"
                          >
                            <Checkbox
                              id={field.fieldKey}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFields([...fields, field]);
                                } else {
                                  setFields(
                                    fields.filter(
                                      (f) => f.fieldKey !== field.fieldKey,
                                    ),
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={field.fieldKey} className="text-md">
                              {field.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>

          {/* Right: Selected Fields */}
          <div className="w-full md:w-[45%] space-y-6 ">
            <div className="space-y-4">
              <ChecklistGenerator
                fields={fields}
                checklist={checklist}
                setChecklist={setChecklist}
              />
            </div>
            <section>
              <Label>Selected Fields (Drag to Reorder)</Label>

              {fields.length > 0 ? (
                <div className="flex flex-wrap gap-4 text-md mt-3">
                  {fields.map((field, i) => (
                    <div key={field.fieldKey} className="w-full sm:w-[48%]">
                      <DraggableField
                        field={field}
                        index={i}
                        moveField={moveField}
                        removeField={() =>
                          setFields(fields.filter((_, idx) => idx !== i))
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic border border-dashed rounded-md p-4">
                  No fields selected yet. Use the checkboxes on the left to add
                  fields to this template.
                </div>
              )}
            </section>
          </div>
        </section>

        {/* Save */}
        <div className="text-right mt-8">
          <Button onClick={handleUpdate}>Update Template</Button>
        </div>
      </div>
    </DndProvider>
  );
}
