"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/shared/ui/input";
import Modal from "@/shared/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import FormError from "@/shared/ui/form-error";
import { Switch } from "@/shared/ui/switch";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

type ConfigType = "types" | "reasons" | "checklist";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ConfigType;
  isEditing?: boolean;
  data?: {
    id: string;
    name: string;
    description?: string;
    isAssetReturnStep?: boolean;
  };
}

const schemas = {
  types: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
  }),
  reasons: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
  }),
  checklist: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    isAssetReturnStep: z.boolean().optional(),
  }),
};

export default function OffboardingConfigModal({
  isOpen,
  onClose,
  activeTab,
  isEditing = false,
  data,
}: ConfigModalProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<(typeof schemas)[typeof activeTab]>>({
    resolver: zodResolver(schemas[activeTab]),
    defaultValues: {
      name: "",
      description: "",
      ...(activeTab === "checklist" ? { isAssetReturnStep: false } : {}),
    },
  });

  useEffect(() => {
    if (isEditing && data) {
      form.reset(data);
    }
  }, [isEditing, data, form]);

  const endpointMap = {
    types: "/api/offboarding-config/type",
    reasons: "/api/offboarding-config/reason",
    checklist: "/api/offboarding-config/checklist",
  };

  const updateEndpoint = `${endpointMap[activeTab]}/${data?.id ?? ""}`;

  const createMutation = useCreateMutation({
    endpoint: endpointMap[activeTab],
    successMessage: "Created successfully",
    refetchKey: `offboarding-config`,
  });

  const updateMutation = useUpdateMutation({
    endpoint: updateEndpoint,
    successMessage: "Updated successfully",
    refetchKey: `offboarding-config`,
    onSuccess: () => {
      onClose();
    },
  });

  useEffect(() => {
    if (isEditing && data) {
      form.reset({
        name: data.name,
        description: data.description,
        isAssetReturnStep: data.isAssetReturnStep ?? false,
      });
    } else {
      // Reset form to blank when adding
      form.reset({
        name: "",
        description: "",
        isAssetReturnStep: false,
      });
    }
  }, [isEditing, data, form]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (values: any) => {
    if (isEditing && data?.id) {
      await updateMutation(values, setError, onClose);
    } else {
      await createMutation(values, setError, form.reset, onClose);
    }
  };

  const titleMap = {
    types: "Termination Type",
    reasons: "Termination Reason",
    checklist: "Checklist Item",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? "Edit" : "Add"} ${titleMap[activeTab]}`}
      confirmText={isEditing ? "Update" : "Add"}
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-6">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Laid Off" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Optional description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {activeTab === "checklist" && (
            <FormField
              name="isAssetReturnStep"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Asset Return Step</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </form>
      </Form>

      {error && <FormError message={error} />}
    </Modal>
  );
}
