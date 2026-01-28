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
import { EmployeeSingleSelect } from "@/shared/ui/employee-single-select";

const schema = z.object({
  cycleId: z.string().uuid(),
  templateId: z.string().uuid(),
  revieweeId: z.string().uuid(),
  type: z.enum(["self", "manager", "peer"]),
});

type ReviewInput = z.infer<typeof schema>;

type Props = {
  open: boolean;
  setOpen: (val: boolean) => void;
};

export default function ReviewFormModal({ open, setOpen }: Props) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const form = useForm<ReviewInput>({
    resolver: zodResolver(schema),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["reviewFormData"],
    queryFn: async () => {
      const [employeesRes, cyclesRes, templatesRes] = await Promise.all([
        axios.get("/api/employees/all/summary"),
        axios.get("/api/performance-cycle"),
        axios.get("/api/templates"),
      ]);

      return {
        employees: employeesRes.data.data,
        cycles: cyclesRes.data.data,
        templates: templatesRes.data.data,
      };
    },
    enabled: Boolean(session?.backendTokens?.accessToken) && open,
  });

  const mutation = useCreateMutation({
    endpoint: "/api/performance-assessments",
    refetchKey: "reviews reviews-counts",
    successMessage: "Review created",
  });

  const onSubmit = (values: ReviewInput) => {
    mutation({
      ...values,
      companyId: session?.user.companyId, // You must ensure this is passed correctly
    });
    setOpen(false);
    form.reset();
  };

  if (isLoading) return <Loading />;

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Create Performance Review"
      confirmText="Create"
      cancelText="Cancel"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
      disableConfirm={!form.formState.isValid}
    >
      <Form {...form}>
        <form className="space-y-5">
          {/* Employee (Reviewee) */}
          <EmployeeSingleSelect name="revieweeId" label="Employee" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cycle */}
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
                      {data?.cycles.map(
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

            {/* Template */}
            <FormField
              name="templateId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {data?.templates.map(
                        (t: { id: string; name: string }) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
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
          {/* Type */}
          <FormField
            name="type"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="self">Self</SelectItem>
                    <SelectItem value="peer">Peer</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
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
