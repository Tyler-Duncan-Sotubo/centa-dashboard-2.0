"use client";

import { useEffect, useRef, useState } from "react";
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
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useRouter } from "next/navigation";
import { FaChevronCircleLeft } from "react-icons/fa";
import Link from "next/link";
import ChecklistGenerator from "../../onboarding/_components/ChecklistGenerator";

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
    fieldType: "select",
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
  const [, drag] = useDrag({
    type: "FIELD",
    item: { index },
  });
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
    if (ref.current) {
      drag(drop(ref.current));
    }
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

export default function TemplateBuilderPage() {
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const router = useRouter();

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

  const createTemplate = useCreateMutation({
    endpoint: "/api/onboarding-seeder/create-company-template",
    successMessage: "Template created successfully!",
    refetchKey: "templates",
    onSuccess: () => {
      router.push("/dashboard/employees/onboarding");
    },
  });

  const handleSave = async () => {
    const payload = { name: templateName, description, fields, checklist };
    await createTemplate(payload);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="px-5">
        <Link href="/dashboard/employees/onboarding-templates">
          <Button variant={"link"} className="p-0 text-md">
            <FaChevronCircleLeft /> Back to Templates
          </Button>
        </Link>
        {/* Template & Fields */}
        <section className="flex flex-col md:flex-row gap-6 mt-6">
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
          <div className="w-full md:w-[45%] space-y-8">
            <div className="space-y-4">
              <ChecklistGenerator
                fields={fields}
                checklist={checklist}
                setChecklist={setChecklist}
              />
            </div>

            <div>
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
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="text-right mt-6">
          <Button onClick={handleSave}>Save Template</Button>
        </div>
      </div>
    </DndProvider>
  );
}
