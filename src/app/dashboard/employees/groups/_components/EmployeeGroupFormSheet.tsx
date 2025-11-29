"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import FormError from "@/components/ui/form-error";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { EmployeeMultiSelect } from "@/components/ui/employee-multi-select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaCirclePlus } from "react-icons/fa6";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { EmployeeGroup, GroupType, MemberRole } from "@/types/team.type";

interface Props {
  isEditing?: boolean;
  selected?: EmployeeGroup | null;
}

/** Make a clean kebab-case slug from a free-form name */
const slugFrom = (raw: string) => {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/&/g, " and ")
    .replace(/['’]/g, "") // remove apostrophes
    .replace(/[^a-z0-9]+/g, "-") // non-alnum -> hyphen
    .replace(/^-+|-+$/g, "") // trim hyphens
    .replace(/-{2,}/g, "-") // collapse dup hyphens
    .slice(0, 120);
};

// ---- Selection helpers (supports string[] OR Option[]) ----
type Option = { value: string; label: string };
type Sel = string | Option;
const getId = (s: Sel) => (typeof s === "string" ? s : s.value);
const getLabel = (s: Sel) => (typeof s === "string" ? s : s.label);

// -----------------------------
// Zod Schema (form shape for submit)
// Allow employeeIds as either string[] or Option[]
// -----------------------------
const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  slug: z.string().max(120, "Max 120 characters").optional(),
  type: z.nativeEnum(GroupType).optional(),
  headcountCap: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number().int().min(0).optional()
  ),
  employeeIds: z
    .union([
      z.array(z.string().uuid()),
      z.array(z.object({ value: z.string().uuid(), label: z.string() })),
    ])
    .optional(),
});

export default function EmployeeGroupFormModal({
  isEditing = false,
  selected,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [slugAuto, setSlugAuto] = useState(true);

  const defaults = useMemo(
    () => ({
      name: selected?.name || "",
      slug: selected?.slug || "",
      type: (selected?.type as GroupType) || GroupType.TEAM,
      headcountCap: selected?.headcountCap ?? undefined,
      // Default to ids[]; EmployeeMultiSelect(showName) will normalize to Option[] internally
      employeeIds: Array.isArray(selected?.members)
        ? selected!.members.map((m: { employeeId: string }) => m.employeeId)
        : [],
    }),
    [selected]
  );

  const form = useForm<z.infer<typeof groupSchema>>({
    resolver: zodResolver(groupSchema),
    defaultValues: defaults,
  });

  const createGroup = useCreateMutation({
    endpoint: "/api/employee-groups",
    successMessage: "Employee group created",
    refetchKey: "employee-groups",
    onSuccess: () => setOpen(false),
  });

  const updateGroup = useUpdateMutation({
    endpoint: `/api/employee-groups/${selected?.id}`,
    successMessage: "Employee group updated",
    refetchKey: "employee-groups",
    onSuccess: () => setOpen(false),
  });

  // Reset defaults when selected changes
  useEffect(() => {
    form.reset(defaults);
  }, [defaults, form]);

  // If editing and slug already exists, stop auto mode by default
  useEffect(() => {
    if (isEditing && selected?.slug) setSlugAuto(false);
  }, [isEditing, selected]);

  // Auto-generate slug when name changes (only while in auto mode)
  const nameValue = form.watch("name");
  useEffect(() => {
    if (slugAuto) {
      form.setValue("slug", slugFrom(nameValue || ""), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [nameValue, slugAuto, form]);

  // ---- Normalize selected employees (supports Option[] or string[]) ----
  const employeeIdsValue = form.watch("employeeIds");
  const employeesSel = useMemo(
    () => (employeeIdsValue as Sel[]) ?? [],
    [employeeIdsValue]
  );

  const selectedIds = useMemo(() => employeesSel.map(getId), [employeesSel]);

  const idToLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of employeesSel) map.set(getId(s), getLabel(s));
    return map;
  }, [employeesSel]);

  // Auto-calc headcount from selected members
  useEffect(() => {
    form.setValue("headcountCap", selectedIds.length, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [selectedIds, form]);

  // ---- Member Meta (roles + primary) ----
  type MemberMeta = { role: MemberRole; isPrimary: boolean };
  const [memberMeta, setMemberMeta] = useState<Record<string, MemberMeta>>({});

  // Keep meta in sync with selection (add defaults, drop removed)
  useEffect(() => {
    setMemberMeta((prev) => {
      const next: Record<string, MemberMeta> = {};
      for (const id of selectedIds) {
        next[id] = prev[id] ?? { role: MemberRole.MEMBER, isPrimary: false };
      }
      return next;
    });
  }, [selectedIds]);

  // Helpers
  const leadId = useMemo(
    () =>
      Object.entries(memberMeta).find(
        ([, m]) => m.role === MemberRole.LEAD
      )?.[0],
    [memberMeta]
  );

  const setUniqueRole = (targetId: string | undefined, role: MemberRole) => {
    if (!targetId) return;
    setMemberMeta((prev) => {
      const updated: Record<string, MemberMeta> = {};
      for (const id of Object.keys(prev)) {
        const current = prev[id];
        if (id === targetId) {
          updated[id] = { ...current, role };
        } else if (current.role === role) {
          // demote any previous holder of this unique role
          updated[id] = { ...current, role: MemberRole.MEMBER };
        } else {
          updated[id] = current;
        }
      }
      return updated;
    });
  };

  // Define the payload type for group creation/updating
  type GroupPayload = {
    name: string;
    slug: string;
    type: GroupType;
    headcountCap: number;
    members: {
      employeeId: string;
      role: MemberRole;
      isPrimary: boolean;
    }[];
  };

  // Build backend payload (CreateGroupDto-compatible)
  const buildPayload = (values: z.infer<typeof groupSchema>): GroupPayload => {
    return {
      name: values.name,
      slug: values.slug || slugFrom(values.name),
      type: values.type || GroupType.TEAM,
      headcountCap: selectedIds.length,
      members: selectedIds.map((id) => ({
        employeeId: id,
        role: memberMeta[id]?.role ?? MemberRole.MEMBER,
        isPrimary: memberMeta[id]?.isPrimary ?? false,
      })),
    };
  };

  const onSubmit = async (values: z.infer<typeof groupSchema>) => {
    const dto = buildPayload(values);
    if (isEditing) {
      await updateGroup(dto, setError, form.reset);
    } else {
      await createGroup(dto, setError, form.reset);
    }
  };

  const trigger = isEditing ? (
    <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
      <Edit size={16} />
    </Button>
  ) : (
    <Button className="bg-brand text-white" onClick={() => setOpen(true)}>
      <FaCirclePlus className="mr-2 h-4 w-4" />
      Create Group
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-2xl min-h-[400px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Team" : "Create Team"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="employee-group-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Group Name */}
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Group Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Engineering Team" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug (auto from name; read-only) */}
              <FormField
                name="slug"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Slug{" "}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (auto from name)
                      </span>
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          placeholder="e.g. engineering-team"
                          onBlur={(e) => {
                            form.setValue("slug", slugFrom(e.target.value), {
                              shouldValidate: true,
                            });
                          }}
                        />
                      </FormControl>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Preview: /team/
                      {form.watch("slug") || slugFrom(form.watch("name") || "")}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Group Type (shadcn Select) */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="type"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Type</FormLabel>
                    <Select
                      value={field.value ?? GroupType.TEAM}
                      onValueChange={(v) => field.onChange(v)}
                      disabled={form.formState.isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a group type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(GroupType).map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Lead */}
              <FormItem>
                <FormLabel>Lead</FormLabel>
                <Select
                  value={leadId ?? ""}
                  onValueChange={(v) =>
                    setUniqueRole(v || undefined, MemberRole.LEAD)
                  }
                  disabled={
                    selectedIds.length === 0 || form.formState.isSubmitting
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedIds.length
                            ? "Pick a lead"
                            : "Select members first"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedIds.map((id) => (
                      <SelectItem key={id} value={id}>
                        {idToLabel.get(id) ?? id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            </div>
            {/* Members Multi-Select -> stores Option[] when showName, ids[] otherwise */}
            <EmployeeMultiSelect
              name="employeeIds"
              placeholder="Search and select employees…"
              label="Team Members"
              showName
            />

            {error && <FormError message={error} />}
          </form>
        </Form>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            form="employee-group-form"
            type="submit"
            disabled={form.formState.isSubmitting}
            isLoading={form.formState.isSubmitting}
            className="bg-brand text-white"
          >
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
