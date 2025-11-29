"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaPlus } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import GenericSheet from "@/components/ui/generic-sheet";
import { Input } from "@/components/ui/input";
import FormError from "@/components/ui/form-error";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LeavePolicy, LeaveType } from "@/types/leave.type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LeaveTypeQuickCreateModal from "./LeaveTypeQuickCreateModal";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { Edit } from "lucide-react";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const createPolicySchema = z.object({
  leaveTypeId: z.string().min(1),
  accrualEnabled: z.boolean(),
  accrualFrequency: z.string().optional(),
  accrualAmount: z.string().optional(),
  allowCarryover: z.boolean(),
  maxBalance: z.string().optional(),
  genderEligibility: z.string().optional(),
  isSplittable: z.boolean(),
});

type PolicyForm = z.infer<typeof createPolicySchema>;

export const LeavePolicyModal = ({
  isEditing = false,
  initialData,
}: {
  isEditing?: boolean;
  initialData?: LeavePolicy;
}) => {
  const axiosInstance = useAxiosAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [addTypeOpen, setAddTypeOpen] = useState(false);
  const { data: session, status } = useSession();

  const form = useForm<PolicyForm>({
    resolver: zodResolver(createPolicySchema),
    defaultValues: initialData || {
      leaveTypeId: "",
      accrualEnabled: false,
      allowCarryover: false,
      isSplittable: true,
      maxBalance: "",
    },
  });

  const fetchLeaveTypes = async () => {
    try {
      const res = await axiosInstance.get("/api/leave-types");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: leaveTypes,
    isLoading: isLoadingLeaveTypes,
    isError,
  } = useQuery<LeaveType[]>({
    queryKey: ["leave-types"],
    queryFn: fetchLeaveTypes,
    enabled: !!session?.backendTokens?.accessToken,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (isEditing && initialData) {
      form.reset(initialData);
    }
  }, [isEditing, form, initialData]);

  const createPolicy = useCreateMutation({
    endpoint: "/api/leave-policy",
    successMessage: "Leave policy created",
    refetchKey: "leave-policies",
    onSuccess: () => setIsOpen(false),
    onError: setError,
  });

  const onSubmit = (data: PolicyForm) => {
    // Clean up accrual fields if accrual is disabled
    if (!data.accrualEnabled) {
      delete data.accrualFrequency;
      delete data.accrualAmount;
    }
    createPolicy(
      {
        ...data,
        maxBalance: data.maxBalance ? Number(data.maxBalance) : 0,
      },
      setError,
      form.reset
    );
  };

  if (status === "loading" || isLoadingLeaveTypes) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div>
        <p>Error</p>
      </div>
    );
  }

  return (
    <GenericSheet
      trigger={
        <>
          {isEditing ? (
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
              <Edit size={24} />
            </Button>
          ) : (
            <Button onClick={() => setIsOpen(true)}>
              <FaPlus />
              Add Leave Policy
            </Button>
          )}
        </>
      }
      open={isOpen}
      onOpenChange={setIsOpen}
      title={isEditing ? "Edit Leave Policy" : "Add Leave Policy"}
      footer={
        <div className="flex justify-end gap-2 mt-6">
          {error && <FormError message={error} />}
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button form="leave-policy-form" type="submit">
            {isEditing ? "Update" : "Save"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="leave-policy-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 mt-4"
        >
          <FormField
            name="leaveTypeId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel required>Leave Type</FormLabel>
                  <Button
                    type="button"
                    size="sm"
                    variant="link"
                    className="px-0"
                    onClick={() => setAddTypeOpen(true)}
                  >
                    Add new
                  </Button>
                </div>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Leave Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leaveTypes?.map((lt) => (
                      <SelectItem key={lt.id} value={lt.id}>
                        {lt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="accrualEnabled"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enable Accrual</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "true")}
                    defaultValue={String(field.value)}
                    className="flex space-x-4"
                  >
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="true" />
                      </FormControl>
                      <FormLabel>Yes</FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="false" />
                      </FormControl>
                      <FormLabel>No</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="accrualFrequency"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accrual Frequency</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. monthly" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="accrualAmount"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accrual Amount</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 2.00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="allowCarryover"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allow Carryover</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      defaultValue={String(field.value)}
                      className="flex space-x-4"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="true" />
                        </FormControl>
                        <FormLabel>Yes</FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="false" />
                        </FormControl>
                        <FormLabel>No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="isSplittable"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Splittable</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      defaultValue={String(field.value)}
                      className="flex space-x-4"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="true" />
                        </FormControl>
                        <FormLabel>Yes</FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="false" />
                        </FormControl>
                        <FormLabel>No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            name="maxBalance"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Balance</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="genderEligibility"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender Eligibility</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="male / female / any" />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
      <LeaveTypeQuickCreateModal
        isOpen={addTypeOpen}
        onClose={() => setAddTypeOpen(false)}
      />
    </GenericSheet>
  );
};
