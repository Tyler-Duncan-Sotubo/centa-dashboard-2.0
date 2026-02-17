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
import { useEffect, useMemo } from "react";
import { Checkbox } from "@/shared/ui/checkbox";

// ✅ UPDATED: cycleId optional OR (startDate required)
// XOR rule remains: exactly one of employeeId or groupId based on ownerType
const createSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),

    cycleId: z.string().uuid().optional().nullable(),

    startDate: z.string().optional().nullable(),
    dueDate: z.string().optional().nullable(),

    ownerType: z.enum(["employee", "group"]).default("employee"),

    employeeId: z.string().uuid().nullable().optional(),
    groupId: z.string().uuid().nullable().optional(),

    visibility: z.enum(["company", "manager", "private"]).optional(),
    status: z.enum(["draft", "active"]).default("active"),
    weight: z.coerce.number().int().min(0).max(100).nullable().optional(),
    addKrsNow: z.boolean().default(false),

    // ✅ NEW FLAG
    isRecurring: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    // ✅ must provide cycleId OR startDate
    if (!data.cycleId && !data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a cycle or provide a start date",
        path: ["cycleId"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a cycle or provide a start date",
        path: ["startDate"],
      });
    }

    // if no cycleId, then startDate + dueDate must exist
    if (!data.cycleId) {
      if (!data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start date is required when no cycle is selected",
          path: ["startDate"],
        });
      }
      if (!data.dueDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Due date is required when no cycle is selected",
          path: ["dueDate"],
        });
      }
    }

    // owner XOR
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
          message: "Select a team",
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

type Cycle = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

export default function ObjectiveModal({ open, setOpen, initialData }: Props) {
  const isEditing = !!initialData;
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const form = useForm<ObjectiveInput>({
    resolver: zodResolver(createSchema),
    mode: "onChange",
    defaultValues: isEditing
      ? {
          title: initialData?.title || "",
          description: initialData?.description || "",
          startDate: initialData?.startDate || null,
          dueDate: initialData?.dueDate || null,
          cycleId: (initialData as any)?.cycleId ?? null,
          ownerType: (initialData as any)?.groupId ? "group" : "employee",
          employeeId: (initialData as any)?.employeeId ?? null,
          groupId: (initialData as any)?.groupId ?? null,
          status:
            ((initialData as any)?.status as "draft" | "active") ?? "active",
          weight: (initialData as any)?.weight ?? null,
          addKrsNow: false,
          isRecurring: Boolean(initialData?.isRecurring),
        }
      : {
          title: "",
          description: "",
          startDate: null,
          dueDate: null,
          cycleId: null,
          ownerType: "employee",
          employeeId: null,
          groupId: null,
          visibility: "company",
          status: "active",
          weight: null,
          addKrsNow: false,
          isRecurring: false,
        },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        startDate: (initialData as any)?.startDate || null,
        dueDate: (initialData as any)?.dueDate || null,
        cycleId: (initialData as any)?.cycleId ?? null,
        ownerType: (initialData as any)?.groupId ? "group" : "employee",
        employeeId: (initialData as any)?.employeeId ?? null,
        groupId: (initialData as any)?.groupId ?? null,
        status:
          ((initialData as any)?.status as "draft" | "active") ?? "active",
        weight: (initialData as any)?.weight ?? null,
        addKrsNow: false,
        isRecurring: Boolean(initialData?.isRecurring),
      });
    } else {
      form.reset({
        title: "",
        description: "",
        startDate: null,
        dueDate: null,
        cycleId: null,
        ownerType: "employee",
        employeeId: null,
        groupId: null,
        visibility: "company",
        status: "active",
        weight: null,
        addKrsNow: false,
        isRecurring: false,
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

  const { data: cycles = [], isLoading: isLoadingCycles } = useQuery<Cycle[]>({
    queryKey: ["performance-cycles"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/performance-cycle");
      return res.data.data;
    },
    enabled: Boolean(session?.backendTokens?.accessToken) && !!open, // only fetch cycles when creating new goal; for editing, we rely on initialData's cycleId and let user change it if they want
  });

  const cyclesById = useMemo(() => {
    const m = new Map<string, Cycle>();
    cycles.forEach((c) => m.set(c.id, c));
    return m;
  }, [cycles]);

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

  // auto-fill dates when cycleId changes (UX only)
  useEffect(() => {
    const sub = form.watch((values, info) => {
      if (info.name !== "cycleId") return;
      const cycleId = values.cycleId ?? null;
      if (!cycleId) return;

      const c = cyclesById.get(cycleId);
      if (!c) return;

      // set dates to cycle boundaries for display + payload safety
      form.setValue("startDate", c.startDate, { shouldValidate: true });
      form.setValue("dueDate", c.endDate, { shouldValidate: true });
    });
    return () => sub.unsubscribe();
  }, [form, cyclesById]);

  const onSubmit = async (values: ObjectiveInput) => {
    const payload: any = {
      title: values.title,
      description: values.description || null,

      // ✅ new: send cycleId if chosen; server will use it
      cycleId: values.cycleId ?? undefined,

      // ✅ keep backward compat: if no cycle selected, dates required
      startDate: values.cycleId ? undefined : (values.startDate ?? undefined),
      dueDate: values.cycleId ? undefined : (values.dueDate ?? undefined),

      employeeId:
        values.ownerType === "employee" ? (values.employeeId ?? null) : null,
      groupId: values.ownerType === "group" ? (values.groupId ?? null) : null,

      status: values.status,
      weight: values.weight ?? null,

      // ✅ NEW FLAG
      isRecurring: values.isRecurring,

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      keyResults: [] as any[],
    };

    if (isEditing) {
      await updateObjective(payload);
      setOpen(false);
      form.reset();
      return;
    }

    await createObjective(payload);
  };

  const hasCycle = Boolean(form.watch("cycleId"));

  return (
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
        <div className="space-y-4">
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
                  <Textarea {...field} className="resize-none h-18" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dates (required only if no cycle selected) */}
          <div className="grid grid-cols-3 gap-4">
            {/* ✅ Cycle (optional) */}
            <FormField
              name="cycleId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cycle (optional)</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(val) => field.onChange(val || null)}
                      disabled={isLoadingCycles}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        {cycles.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="startDate"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required={!hasCycle}>Start Date</FormLabel>
                  <FormControl>
                    <DateInput
                      value={field.value ?? ""}
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
                  <FormLabel required={!hasCycle}>Due Date</FormLabel>
                  <FormControl>
                    <DateInput
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Owner Type */}
          <div className="grid grid-cols-2 gap-4">
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
                        value={field.value ?? ""}
                        onValueChange={(val) => field.onChange(val || null)}
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
          </div>
          {/* Weight */}
          <div className="grid grid-cols-2 gap-4">
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

            {/* Status */}
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
          {/* ✅ NEW: Recurring flag */}
          <FormField
            name="isRecurring"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                  />
                </FormControl>

                <div className="space-y-1 leading-none">
                  <FormLabel>Recurring (rollover to next cycle)</FormLabel>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </Modal>
  );
}
