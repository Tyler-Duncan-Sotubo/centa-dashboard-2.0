"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/shared/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import DynamicFeedbackForm from "./DynamicFeedbackForm";
import { Switch } from "@/shared/ui/switch";
import { FaLock } from "react-icons/fa6";
import { useState } from "react";
import { EmployeeSingleSelect } from "@/shared/ui/employee-single-select";
import { useToast } from "@/shared/hooks/use-toast";

// Schema matching your DTO
const feedbackSchema = z.object({
  recipientId: z.string().uuid().optional(),
  isAnonymous: z.boolean(),
  shareScope: z.enum(["private", "managers", "person_managers", "team"]),
});

type FeedbackInput = z.infer<typeof feedbackSchema>;

type Props = {
  open: boolean;
  setOpen: (val: boolean) => void;
  type: "self" | "peer" | "manager_to_employee" | "employee_to_manager";
};

export default function FeedbackFormModal({ open, setOpen, type }: Props) {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const form = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      isAnonymous: false,
      shareScope: "private",
    },
  });

  const createFeedback = useCreateMutation({
    endpoint: "/api/feedback",
    successMessage: "Feedback submitted successfully",
    refetchKey: "feedbacks",
  });

  const onSubmit = (data: FeedbackInput) => {
    const formattedResponses = Object.entries(responses).map(
      ([questionId, answer]) => ({
        questionId,
        answer,
      }),
    );

    if (formattedResponses.length === 0) {
      toast({
        title: "No responses",
        description: "Please answer at least one question.",
        variant: "destructive",
      });
      return;
    }

    createFeedback({
      ...data,
      responses: formattedResponses,
      type: type,
    });

    setOpen(false);
    form.reset();
    setResponses({});
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Submit Feedback"
      confirmText="Submit"
      cancelText="Cancel"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <Form {...form}>
        <form className="space-y-6">
          {type !== "self" && (
            <>
              <EmployeeSingleSelect
                name="recipientId"
                label="Recipient"
                placeholder="Select an employee"
              />

              <FormField
                name="isAnonymous"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Anonymous</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Submit this feedback anonymously
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-6 w-11"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </>
          )}
          <FormField
            name="shareScope"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Share With</FormLabel>
                  <FaLock size={20} />
                </div>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""} // ensures empty initial state
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select share scope" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="private">
                      Private (only this person)
                    </SelectItem>
                    <SelectItem value="managers">
                      Managers (only this person&apos;s manager(s))
                    </SelectItem>
                    <SelectItem value="person_managers">
                      Person + Managers
                    </SelectItem>
                    <SelectItem value="team">
                      Team (everyone in Peer&apos;s department)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <DynamicFeedbackForm
              open={open}
              type={type}
              responses={responses}
              setResponses={setResponses}
            />
          </div>
        </form>
      </Form>
    </Modal>
  );
}
