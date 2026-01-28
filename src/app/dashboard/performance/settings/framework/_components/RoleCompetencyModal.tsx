"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/shared/ui/label";
import { Form, FormField, FormItem, FormMessage } from "@/shared/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import Modal from "@/shared/ui/modal";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

const schema = z.object({
  competencyId: z.string().uuid({ message: "Required" }),
  expectedLevelId: z.string().min(1, "Required"),
});

type ExpectationFormInput = z.infer<typeof schema>;

interface Props {
  open: boolean;
  setOpen: (val: boolean) => void;
  roleId: string;
  initialData?: {
    id: string;
    competencyId: string;
    expectedLevelId: string;
  } | null;
}

export default function RoleCompetencyModal({
  open,
  setOpen,
  roleId,
  initialData,
}: Props) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const form = useForm<ExpectationFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      competencyId: "",
      expectedLevelId: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        competencyId: initialData.competencyId,
        expectedLevelId: initialData.expectedLevelId,
      });
    }
  }, [initialData, form]);

  const create = useCreateMutation({
    endpoint: "/api/performance-seed/role-expectations",
    successMessage: "Expectation added",
    refetchKey: "framework-settings",
  });

  const update = useUpdateMutation({
    endpoint: `/api/performance-seed/role-expectations/${initialData?.id}`,
    successMessage: "Expectation updated",
    refetchKey: "framework-settings",
  });

  const { data: fields, isLoading } = useQuery({
    queryKey: ["framework-modal-fields"],
    queryFn: async () => {
      const res = await axios.get("/api/performance-seed/framework-fields");
      return res.data.data;
    },
    enabled: Boolean(session?.backendTokens?.accessToken) && open,
  });

  const onSubmit = async (data: ExpectationFormInput) => {
    if (initialData) {
      await update({
        roleId,
        id: initialData.id,
        ...data,
      });
    } else {
      create({
        ...data,
        roleId,
      });
    }
    setOpen(false);
    form.reset();
  };

  if (isLoading) return <Loading />;

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title={initialData ? "Edit Expectation" : "Add Expectation"}
      confirmText={initialData ? "Update" : "Create"}
      cancelText="Cancel"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
      disableConfirm={!form.formState.isValid}
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="competencyId"
            render={({ field }) => (
              <FormItem>
                <Label>Competency</Label>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!!initialData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select competency" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields?.competencies?.map(
                      (c: { id: string; name: string }) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expectedLevelId"
            render={({ field }) => (
              <FormItem>
                <Label>Expected Level</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields?.levels?.map(
                      (lvl: { id: string; name: string }) => (
                        <SelectItem key={lvl.id} value={lvl.id}>
                          {lvl.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </Modal>
  );
}
