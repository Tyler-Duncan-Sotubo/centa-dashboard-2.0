"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import FormError from "@/shared/ui/form-error";
import { Checkbox } from "@/shared/ui/checkbox";
import { groupSchema, GroupSchemaType } from "@/schema/group";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { PaySchedule } from "@/types/pay-schedule";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PayGroupModal = ({ isOpen, onClose }: GroupModalProps) => {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyPayScheduleSummary = async () => {
    try {
      const res = await axiosInstance.get("/api/pay-schedules");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data: schedule, isLoading: scheduleLoading } = useQuery<
    PaySchedule[]
  >({
    queryKey: ["company"],
    queryFn: fetchCompanyPayScheduleSummary,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  const form = useForm<z.infer<typeof groupSchema>>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      applyPaye: false,
      applyPension: false,
      applyNhf: false,
    },
  });

  const createGroup = useCreateMutation({
    endpoint: "/api/pay-groups",
    successMessage: "Group added successfully",
    refetchKey: "groups company-elements",
  });

  const onSubmit = async (values: z.infer<typeof groupSchema>) => {
    setError(null);
    await createGroup(values, setError, form.reset, onClose);
  };

  if (scheduleLoading) return <Loading />;
  if (!schedule) return <p>Error loading data</p>;

  // Populate form when editing
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Group"
      confirmText="Add"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 my-6">
          {/* Group Name Input */}
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Group Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter group name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Checkboxes */}
          <div className="space-y-3">
            {[
              { name: "applyPaye", label: "Apply PAYE" },
              { name: "applyPension", label: "Apply Pension" },
              { name: "applyNhf", label: "Apply NHF" },
            ].map(({ name, label }) => (
              <FormField
                key={name}
                name={name as keyof GroupSchemaType}
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id={name}
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          setError(null); // Remove error when checked
                        }}
                        className="h-5 w-5"
                      />
                    </FormControl>
                    <label
                      htmlFor={name}
                      className="text-md font-bold text-gray-700 cursor-pointer leading-relaxed"
                    >
                      {label}
                    </label>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <FormField
            name="payScheduleId"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Select Pay Schedule</FormLabel>
                <Select
                  onValueChange={(selectedPayGroup) => {
                    field.onChange(selectedPayGroup);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Pay Group"></SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {schedule?.map((payGroup) => (
                      <SelectItem key={payGroup.id} value={payGroup.id}>
                        {payGroup.payFrequency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* Display error message if there is one */}
      {error && <FormError message={error} />}
    </Modal>
  );
};
