/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodTypeAny } from "zod";

import GenericSheet from "@/shared/ui/generic-sheet";
import Modal from "@/shared/ui/modal";
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

/* ✅ no-deps mobile hook */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}

const entityConfig = {
  profile: {
    title: "Profile",
    schema: profileSchema,
    fields: profileFields,
    endpoint: (id: string) => `/api/employee-profile/${id}`,
  },
  dependent: {
    title: "Dependent",
    schema: dependentSchema,
    fields: dependentFields,
    endpoint: (id: string) => `/api/dependents/${id}`,
  },
  history: {
    title: "History Entry",
    schema: historySchema,
    fields: historyFields,
    endpoint: (id: string) => `/api/employee-history/${id}`,
  },
  certification: {
    title: "Certification",
    schema: certificationSchema,
    fields: certificationFields,
    endpoint: (id: string) => `/api/employee-certifications/${id}`,
  },
  finance: {
    title: "Financials",
    schema: bankSchema,
    fields: bankFields,
    endpoint: (id: string) => `/api/employee-finance/${id}`,
  },
  compensation: {
    title: "Compensation",
    schema: compensationSchema,
    fields: compensationFields,
    endpoint: (id: string) => `/api/employee-compensation/${id}`,
  },
} as const;

type EntityType = keyof typeof entityConfig;

interface EntitySheetProps {
  entityType: EntityType;
  initialData?: any;
  employeeId: string;
  recordId?: string;
}

export function EntitySheet({
  entityType,
  initialData,
  employeeId,
  recordId,
}: EntitySheetProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cfg = entityConfig[entityType];

  const isEditing = Boolean(initialData || recordId);
  const TriggerIcon = isEditing ? Edit : Plus;

  const form = useForm({
    resolver: zodResolver(cfg.schema as any),
    defaultValues: (initialData as any) || {},
  });

  const mutation = useCreateMutation({
    endpoint: cfg.endpoint(employeeId),
    successMessage: isEditing
      ? `${cfg.title} updated successfully`
      : `${cfg.title} created successfully`,
    refetchKey: "employee",
    onSuccess: () => setOpen(false),
  });

  const onSubmit = async (values: any) => {
    await mutation(values, setError, form.reset);
    setOpen(false);
  };

  const content = (
    <Form {...form}>
      <form
        id="entity-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 mt-6 mb-5"
      >
        <DynamicFormFields control={form.control} fields={cfg.fields as any} />
        {error && <FormError message={error} />}
      </form>
    </Form>
  );

  const title = recordId ? `Edit ${cfg.title}` : `Add ${cfg.title}`;

  /* 📱 MOBILE → MODAL */
  if (isMobile) {
    return (
      <>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <TriggerIcon />
        </Button>

        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title={title}
          confirmText={recordId ? "Update" : "Save"}
          onConfirm={form.handleSubmit(onSubmit)}
        >
          {content}
        </Modal>
      </>
    );
  }

  /* 🖥 DESKTOP → SHEET */
  return (
    <GenericSheet
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="ghost" size="icon">
          <TriggerIcon />
        </Button>
      }
      title={title}
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
      {content}
    </GenericSheet>
  );
}
