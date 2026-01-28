"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/shared/ui/modal";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/shared/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { DateInput } from "@/shared/ui/date-input";
import { EmployeeSingleSelect } from "@/shared/ui/employee-single-select";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { Goal } from "@/types/performance/goals.type";
import { useEffect } from "react";

// --------------- Schema (Objective only; KRs added later) ---------------
// XOR rule: exactly one of employeeId or groupId must be set, based on ownerType.
const createSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    dueDate: z.string().min(1, "Due date is required"),
    // cycles are auto-resolved server-side; keep field if you still want to show it later
    cycleId: z.string().uuid().optional(),

    // NEW: choose how we own this goal
    ownerType: z.enum(["employee", "group"]).default("employee"),

    // NEW: single owner fields
    employeeId: z.string().uuid().nullable().optional(),
    groupId: z.string().uuid().nullable().optional(), // demo input for now

    visibility: z.enum(["company", "manager", "private"]).optional(),
    status: z.enum(["draft", "active"]).default("active"),
    weight: z.coerce.number().int().min(0).max(100).nullable().optional(),
    addKrsNow: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.ownerType === "employee") {
      if (!data.employeeId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select an employee owner",
          path: ["employeeId"],
        });
      }
      if (data.groupId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Remove groupId when owner type is employee",
          path: ["groupId"],
        });
      }
    } else {
      if (!data.groupId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a groupId (demo)",
          path: ["groupId"],
        });
      }
      if (data.employeeId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Remove employeeId when owner type is group",
          path: ["employeeId"],
        });
      }
    }
  });

type ObjectiveInput = z.infer<typeof createSchema>;

type Props = {
  open: boolean;
  setOpen: (val: boolean) => void;
  initialData?: Goal | null;
};

export default function ObjectiveModal({ open, setOpen, initialData }: Props) {
  const isEditing = !!initialData;
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const form = useForm<ObjectiveInput>({
    resolver: zodResolver(createSchema),
    defaultValues: isEditing
      ? {
          title: initialData?.title || "",
          description: initialData?.description || "",
          startDate: initialData?.startDate || "",
          dueDate: initialData?.dueDate || "",
          cycleId: initialData?.cycleId || undefined,
          // pick owner type based on what exists
          ownerType: initialData?.groupId ? "group" : "employee",
          employeeId: initialData?.employeeId ?? undefined,
          groupId: initialData?.groupId ?? undefined,
          status: (initialData?.status as "draft" | "active") ?? "active",
          weight: initialData?.weight ?? undefined,
          addKrsNow: false,
        }
      : {
          title: "",
          description: "",
          startDate: "",
          dueDate: "",
          cycleId: undefined,
          ownerType: "employee",
          employeeId: undefined,
          groupId: undefined,
          visibility: "company",
          status: "active",
          weight: undefined,
          addKrsNow: false,
        },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        startDate: initialData.startDate || "",
        dueDate: initialData.dueDate || "",
        cycleId: initialData.cycleId || undefined,
        ownerType: initialData.groupId ? "group" : "employee",
        employeeId: initialData.employeeId ?? undefined,
        groupId: initialData.groupId ?? undefined,
        status: (initialData.status as "draft" | "active") ?? "active",
        weight: initialData.weight ?? undefined,
        addKrsNow: false,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        startDate: "",
        dueDate: "",
        cycleId: undefined,
        ownerType: "employee",
        employeeId: undefined,
        groupId: undefined,
        visibility: "company",
        status: "active",
        weight: undefined,
        addKrsNow: false,
      });
    }
  }, [initialData, form]);

  const { data: employeeGroups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ["employee-groups"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/employee-groups");
      return res.data.data;
    },
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  // ---------- Mutations ----------
  const createObjective = useCreateMutation({
    endpoint: "/api/performance-goals",
    successMessage: "Goal created",
    refetchKey: "goals goals-counts",
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });

  const updateObjective = useUpdateMutation({
    endpoint: `/api/performance-goals/${initialData?.id}`,
    successMessage: "Goal updated",
    refetchKey: "goals",
  });

  // ---------- Submit ----------
  const onSubmit = async (values: ObjectiveInput) => {
    const payload = {
      title: values.title,
      description: values.description || null,
      startDate: values.startDate,
      dueDate: values.dueDate,
      // server auto-resolves cycle by startDate; do not send cycleId unless you need it
      employeeId:
        values.ownerType === "employee" ? (values.employeeId ?? null) : null,
      groupId: values.ownerType === "group" ? (values.groupId ?? null) : null, // demo
      status: values.status,
      weight: values.weight ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      keyResults: [] as any[], // create objective first; add KRs on next page
    };

    if (isEditing) {
      await updateObjective(payload);
      setOpen(false);
      form.reset();
      return;
    }

    await createObjective(payload);
  };

  return (
    <>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={isEditing ? "Edit Objective" : "Create Objective"}
        confirmText={isEditing ? "Update" : "Create"}
        cancelText="Cancel"
        onConfirm={form.handleSubmit(onSubmit)}
        isLoading={form.formState.isSubmitting}
        disableConfirm={!form.formState.isValid}
      >
        <Form {...form}>
          <div className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="startDate"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Start Date</FormLabel>
                    <FormControl>
                      <DateInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="dueDate"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Due Date</FormLabel>
                    <FormControl>
                      <DateInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Owner Type */}
            <FormField
              name="ownerType"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Owner Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="group">Team</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional Owner Inputs */}
            {form.watch("ownerType") === "employee" ? (
              <EmployeeSingleSelect
                name="employeeId"
                label="Select owner (employee)"
              />
            ) : (
              <FormField
                name="groupId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Team</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isLoadingGroups}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a group" />
                        </SelectTrigger>
                        <SelectContent>
                          {employeeGroups.map(
                            (group: { id: string; name: string }) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Weight */}
            <FormField
              name="weight"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (0–100)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status (draft/active) */}
            <FormField
              name="status"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </Modal>
    </>
  );
}
