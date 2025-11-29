"use client";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Modal from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";

const schema = z.object({
  managerId: z.string().min(1, "Manager is required"),
});

type ManagerFormInput = z.infer<typeof schema>;

interface Manager {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  setOpen: (val: boolean) => void;
  appraisalId: string;
  currentManagerId?: string | null;
}

export default function ManagerAssignmentModal({
  open,
  setOpen,
  appraisalId,
  currentManagerId,
}: Props) {
  const { data: session, status } = useSession();
  const axios = useAxiosAuth();
  const form = useForm<ManagerFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      managerId: currentManagerId || "",
    },
  });

  useEffect(() => {
    form.reset({
      managerId: currentManagerId || "",
    });
  }, [currentManagerId, form]);

  const {
    data: managers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["all-managers"],
    queryFn: async () => {
      const res = await axios.get("/api/employees/company-managers/all");
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken && open,
  });

  const update = useUpdateMutation({
    endpoint: `/api/appraisals/${appraisalId}/manager`,
    successMessage: "Manager updated",
    refetchKey: "appraisal-cycles", // or "appraisals", depending on where it's used
  });

  const onSubmit = async (data: ManagerFormInput) => {
    await update(data);
    setOpen(false);
    form.reset();
  };

  if (status === "loading" || isLoading) return <Loading />;
  if (isError)
    return <p className="p-4 text-red-600">Error loading form data</p>;

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Re-Assign Manager"
      confirmText="Save"
      cancelText="Cancel"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
      disableConfirm={!form.formState.isValid}
    >
      <Form {...form}>
        <FormField
          control={form.control}
          name="managerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Manager</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager: Manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    </Modal>
  );
}
