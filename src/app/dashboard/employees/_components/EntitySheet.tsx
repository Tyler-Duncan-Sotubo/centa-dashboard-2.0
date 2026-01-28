/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodTypeAny } from "zod";
import GenericSheet from "@/shared/ui/generic-sheet";
import { Button } from "@/shared/ui/button";
import { Edit, Plus } from "lucide-react";
import { Form } from "@/shared/ui/form";

import { DynamicFormFields } from "./personal/DynamicFormFields";
import {
  profileFields,
  profileSchema,
  dependentFields,
  dependentSchema,
  historyFields,
  historySchema,
  certificationFields,
  certificationSchema,
  bankFields,
  bankSchema,
  compensationSchema,
  compensationFields,
} from "../schema/fields";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import FormError from "@/shared/ui/form-error";

const entityConfig = {
  profile: {
    title: "Profile",
    icon: <Edit />,
    schema: profileSchema,
    fields: profileFields,
    endpoint: (id: string) => `/api/employee-profile/${id}`,
  },
  dependent: {
    title: "Dependent",
    icon: <Edit />,
    schema: dependentSchema,
    fields: dependentFields,
    endpoint: (id: string) => `/api/dependents/${id}`,
  },
  history: {
    title: "History Entry",
    icon: <Edit />,
    schema: historySchema,
    fields: historyFields,
    endpoint: (id: string) => `/api/employee-history/${id}`,
  },
  certification: {
    title: "Certification",
    icon: <Edit />,
    schema: certificationSchema,
    fields: certificationFields,
    endpoint: (id: string) => `/api/employee-certifications/${id}`,
  },
  employee: {
    title: "Employment Details",
    icon: <Edit />,
    schema: profileSchema, // Reusing profile schema for employment details
    fields: profileFields, // Reusing profile fields for employment details
    endpoint: (id: string) => `/api/employee-details/${id}`,
  },
  finance: {
    title: "Financials",
    icon: <Edit />,
    schema: bankSchema,
    fields: bankFields,
    endpoint: (id: string) => `/api/employee-finance/${id}`,
  },
  compensation: {
    title: "Compensation",
    icon: <Edit />,
    schema: compensationSchema,
    fields: compensationFields,
    endpoint: (id: string) => `/api/employee-compensation/${id}`,
  },
} as const;

type EntityType = keyof typeof entityConfig;

interface EntitySheetProps<Schema extends ZodTypeAny> {
  entityType: EntityType;
  initialData?: Partial<z.infer<Schema>>;
  employeeId: string;
  recordId?: string;
}

export function EntitySheet<Schema extends ZodTypeAny>({
  entityType,
  initialData,
  employeeId,
  recordId,
}: EntitySheetProps<Schema>) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cfg = entityConfig[entityType] as {
    title: string;
    icon: React.ReactNode;
    schema: ZodTypeAny;
    fields: typeof profileFields; // we only index by fields array shape
    endpoint: (id: string) => string;
  };

  const isEditing = Boolean(initialData || recordId);
  const TriggerIcon = isEditing ? Edit : Plus;

  const form = useForm<z.infer<Schema>>({
    resolver: zodResolver(cfg.schema),
    defaultValues: (initialData as any) || {},
  });

  const createORUpdateData = useCreateMutation({
    endpoint: cfg.endpoint(employeeId),
    successMessage: isEditing
      ? `${cfg.title} updated successfully`
      : `${cfg.title} created successfully`,
    refetchKey: "employee",
    onSuccess: () => {
      setOpen(false);
    },
  });

  const onSubmit = async (data: z.infer<Schema>) => {
    await createORUpdateData(data, setError, form.reset);
    setOpen(false);
  };

  return (
    <GenericSheet
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <TriggerIcon />
        </Button>
      }
      title={recordId ? `Edit ${cfg.title}` : `Add ${cfg.title}`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="entity-form">
            {recordId ? "Update" : "Save"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="entity-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 mt-10 mb-5"
        >
          <DynamicFormFields control={form.control} fields={cfg.fields} />
        </form>
        {error && <FormError message={error} />}
      </Form>
    </GenericSheet>
  );
}
