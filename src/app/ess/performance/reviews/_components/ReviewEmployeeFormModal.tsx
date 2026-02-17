"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/shared/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/ui/select";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import Loading from "@/shared/ui/loading";

const schema = z.object({
  cycleId: z.string().uuid({ message: "Cycle is required" }),
});

type SelfReviewInput = z.infer<typeof schema>;

type Props = {
  open: boolean;
  setOpen: (val: boolean) => void;
};

export default function ReviewEmployeeSelfCreateModal({
  open,
  setOpen,
}: Props) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const form = useForm<SelfReviewInput>({
    resolver: zodResolver(schema),
    defaultValues: { cycleId: undefined as any },
    mode: "onChange",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["selfReviewCycles"],
    queryFn: async () => {
      const cyclesRes = await axios.get("/api/performance-cycle");
      return { cycles: cyclesRes.data.data };
    },
    enabled: Boolean(session?.backendTokens?.accessToken) && open,
  });

  const mutation = useCreateMutation({
    endpoint: "/api/performance-assessments",
    refetchKey: "ess-appraisals reviews reviews-counts",
    successMessage: "Self assessment created",
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  const onSubmit = (values: SelfReviewInput) => {
    // Only send cycle + type. Backend resolves employee + template.
    mutation({
      cycleId: values.cycleId,
      type: "self",
      revieweeId: session?.employeeId!,
    } as any);
  };

  if (isLoading) return <Loading />;

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Create Self Assessment"
      confirmText="Create"
      cancelText="Cancel"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
      disableConfirm={!form.formState.isValid}
    >
      <Form {...form}>
        <form className="space-y-5">
          <FormField
            name="cycleId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Performance Cycle</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cycle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {data?.cycles?.map(
                      (cycle: { id: string; name: string }) => (
                        <SelectItem key={cycle.id} value={cycle.id}>
                          {cycle.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
}
