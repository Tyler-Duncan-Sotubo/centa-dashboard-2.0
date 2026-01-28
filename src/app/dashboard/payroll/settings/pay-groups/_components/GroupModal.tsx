"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/shared/ui/input";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Employee } from "@/types/employees.type";
import Loading from "@/shared/ui/loading";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { PaySchedule } from "@/types/pay-schedule";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import GenericSheet from "@/shared/ui/generic-sheet";
import { Edit } from "lucide-react";
import { Button } from "@/shared/ui/button";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { FaCirclePlus } from "react-icons/fa6";

interface GroupModalProps {
  isEditing?: boolean;
  id?: string;
  name?: string;
}

const GroupModal = ({ id, isEditing = false, name }: GroupModalProps) => {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [isSheetOpen, setSheetOpen] = useState(false);

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

  const fetchGroup = async (id: string | undefined) => {
    try {
      const res = await axiosInstance.get(`/api/pay-groups/${id}`);
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: schedule,
    refetch: refetchPayGroup,
    isLoading: scheduleLoading,
  } = useQuery<PaySchedule[]>({
    queryKey: ["pay-schedules"],
    queryFn: fetchCompanyPayScheduleSummary,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  // Fetch group data when editing
  const { data: group, isLoading: isLoadingGroup } = useQuery<GroupSchemaType>({
    queryKey: ["group", id],
    queryFn: () => fetchGroup(id),
    enabled:
      !!isEditing && !!id && Boolean(session?.backendTokens?.accessToken),
  });

  // Fetch employees only when modal opens
  useEffect(() => {
    if (isSheetOpen) {
      const cachedPayGroup = queryClient.getQueryData<Employee[]>(["company"]);

      if (!cachedPayGroup) {
        refetchPayGroup();
      }
    }
  }, [queryClient, refetchPayGroup, isSheetOpen]);

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
    refetchKey: "pay-group onboarding",
    onSuccess: () => {
      setSheetOpen(false);
    },
    onError: () => {
      setSheetOpen(false);
    },
  });

  const updateGroup = useUpdateMutation({
    endpoint: `/api/pay-groups/${id}`,
    successMessage: "Group updated successfully",
    refetchKey: "pay-group",
    onSuccess: () => {
      setSheetOpen(false);
    },
    onError: () => {
      setSheetOpen(false);
    },
  });

  const onSubmit = async (values: z.infer<typeof groupSchema>) => {
    setError(null);
    if (isEditing) {
      await updateGroup(
        {
          ...values,
          payScheduleId: group?.payScheduleId,
        },
        setError,
      );
    } else {
      await createGroup(values, setError, form.reset);
    }
  };

  // Populate form when editing
  useEffect(() => {
    if (isEditing && group) {
      form.reset({
        name: name,
        applyPaye: group.applyPaye ?? false,
        applyPension: group.applyPension ?? false,
        applyNhf: group.applyNhf ?? false,
      });
    }
  }, [isEditing, form, group, name]);

  if (isEditing && isLoadingGroup && scheduleLoading) return <Loading />;

  const trigger = isEditing ? (
    <Button
      variant="ghost"
      className="p-3 text-brandDark"
      onClick={() => setSheetOpen(true)}
    >
      <Edit size={24} />
    </Button>
  ) : (
    <Button onClick={() => setSheetOpen(true)}>
      <FaCirclePlus className="mr-2 h-4 w-4" />
      Add Pay Group
    </Button>
  );

  return (
    <GenericSheet
      trigger={trigger}
      title={isEditing ? "Edit Group" : "Create Group"}
      description="Configure group settings and assign members."
      position="right"
      open={isSheetOpen}
      onOpenChange={setSheetOpen}
      footer={
        <div className="flex items-center space-x-2">
          {error && <FormError message={error} />}
          <Button
            form="group-form"
            type="submit"
            className="px-4 py-2 bg-brand text-white rounded"
            disabled={form.formState.isSubmitting}
          >
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="group-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 my-6"
        >
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

          {!isEditing && (
            <>
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
                          <SelectItem
                            key={payGroup.id}
                            value={payGroup.id}
                            className="capitalize"
                          >
                            {payGroup.payFrequency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </form>
      </Form>

      {/* Display error message if there is one */}
      {error && <FormError message={error} />}
    </GenericSheet>
  );
};

export default GroupModal;
