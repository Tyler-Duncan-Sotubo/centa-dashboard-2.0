"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import Modal from "@/shared/ui/modal";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { ReviewTemplate } from "./PerformanceTemplates";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/ui/alert-dialog";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  includeGoals: z.boolean().default(false),
  includeAttendance: z.boolean().default(false),
  includeFeedback: z.boolean().default(false),
  includeQuestionnaire: z.boolean().default(true),
  requireSignature: z.boolean().default(false),
  restrictVisibility: z.boolean().default(false),
});

type TemplateFormInput = z.infer<typeof schema>;

interface Props {
  open: boolean;
  setOpen: (val: boolean) => void;
  initialData?: ReviewTemplate | null;
}

export default function ReviewTemplateModal({
  open,
  setOpen,
  initialData,
}: Props) {
  const form = useForm<TemplateFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      isDefault: false,
      includeGoals: false,
      includeAttendance: false,
      includeFeedback: false,
      includeQuestionnaire: true,
      requireSignature: false,
      restrictVisibility: false,
    },
  });

  const router = useRouter();
  const [confirmRedirect, setConfirmRedirect] = useState(false);
  const [newId, setNewId] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description ?? "",
        isDefault: initialData.isDefault,
        includeGoals: initialData.includeGoals,
        includeAttendance: initialData.includeAttendance,
        includeFeedback: initialData.includeFeedback,
        includeQuestionnaire: initialData.includeQuestionnaire,
        requireSignature: initialData.requireSignature,
        restrictVisibility: initialData.restrictVisibility,
      });
    } else {
      form.reset();
    }
  }, [initialData, form]);

  const create = useCreateMutation({
    endpoint: "/api/templates",
    successMessage: "Template created",
    refetchKey: "templates",
    onSuccess: (created) => {
      const typed = created as { data: { id: string } };
      if (form.getValues("includeQuestionnaire")) {
        setNewId(typed?.data?.id);
        setOpen(false);
        form.reset();
        setConfirmRedirect(true);
      }
    },
  });

  const update = useUpdateMutation({
    endpoint: `/api/templates/${initialData?.id}`,
    successMessage: "Template updated",
    refetchKey: "templates",
  });

  const onSubmit = async (values: TemplateFormInput) => {
    if (initialData) {
      await update(values);
      setOpen(false);
      form.reset();
    } else {
      await create(values); // onSuccess handles next step
    }
  };

  return (
    <>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={initialData ? "Edit Template" : "Create Template"}
        confirmText={initialData ? "Update" : "Create"}
        cancelText="Cancel"
        onConfirm={form.handleSubmit(onSubmit)}
        isLoading={form.formState.isSubmitting}
        disableConfirm={!form.formState.isValid}
      >
        <Form {...form}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label>Name</Label>
                  <Input {...field} placeholder="e.g. Mid-Year Review" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <Label>Description</Label>
                  <Input {...field} placeholder="Short summary or purpose" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Label className="my-4 text-lg">Options</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: "includeGoals", label: "Goals" },
                  { key: "includeAttendance", label: "Attendance" },
                  { key: "includeFeedback", label: "Feedback" },
                  { key: "includeQuestionnaire", label: "Questionnaire" },
                ].map(({ key, label }) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={key as keyof TemplateFormInput}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0">
                        <div className="pt-1">
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                            className="h-8 w-8"
                            disabled={key === "includeQuestionnaire"}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>{label}</Label>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormDescription className="mt-2 text-md">
                The template will include in the review. You can select multiple
                options.
              </FormDescription>
            </div>
            {[
              {
                key: "requireSignature",
                label: "Require Signature",
                description:
                  "Employee and reviewer must sign the final report.",
              },
              {
                key: "restrictVisibility",
                label: "Restrict Visibility",
                description: "Only HR and direct managers can view the review.",
              },
            ].map(({ key, label, description }) => (
              <FormField
                key={key}
                control={form.control}
                name={key as keyof TemplateFormInput}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{label}</Label>
                        <FormDescription>{description}</FormDescription>
                      </div>
                      <Switch
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </Form>
      </Modal>

      {/* Confirmation Modal */}
      <AlertDialog open={confirmRedirect} onOpenChange={setConfirmRedirect}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Questions?</AlertDialogTitle>
            <AlertDialogDescription>
              You selected <strong>“Include Questionnaire”</strong>. Would you
              like to add questions to the template now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (newId)
                  router.push(
                    `/dashboard/performance/settings/templates/${newId}`,
                  );
                setConfirmRedirect(false);
              }}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
