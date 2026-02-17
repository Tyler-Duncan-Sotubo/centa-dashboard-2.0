"use client";

import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/shared/ui/form";
import { Label } from "@/shared/ui/label";
import Modal from "@/shared/ui/modal";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { Checkbox } from "@/shared/ui/checkbox";
import { ScrollArea } from "@/shared/ui/scroll-area";
import Loading from "@/shared/ui/loading";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { Competency } from "@/types/performance/question-competency.type";

type Props = {
  open: boolean;
  setOpen: (val: boolean) => void;
  templateId: string;
};

type FormInput = {
  questionIds: string[];
};

export default function AssignQuestionsModal({
  open,
  setOpen,
  templateId,
}: Props) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const form = useForm<FormInput>({
    defaultValues: {
      questionIds: [],
    },
  });

  const {
    data: competencies = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["competencies"],
    queryFn: async () => {
      const res = await axios.get("/api/performance-seed/competencies");
      return res.data.data as Competency[];
    },
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  const assignQuestions = useCreateMutation({
    endpoint: `/api/templates/${templateId}/questions`,
    successMessage: "Questions assigned successfully",
    refetchKey: "template-questions",
  });

  const onSubmit = (data: FormInput) => {
    assignQuestions({
      questionIds: data.questionIds,
      templateId,
    });
    setOpen(false);
  };

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading competencies</p>;

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Assign Questions"
      confirmText="Assign"
      cancelText="Cancel"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <Form {...form}>
        <ScrollArea className="h-100 pr-4">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="questionIds"
              render={({ field }) => (
                <FormItem>
                  <Label>Select Questions</Label>
                  <div className="space-y-4 mt-2">
                    {competencies.map((comp) => (
                      <div key={comp.id}>
                        <p className="text-sm font-semibold mb-2">
                          {comp.name}
                        </p>
                        <div className="space-y-1 pl-2">
                          {comp.questions.map((q) => (
                            <div
                              key={q.id}
                              className="flex items-center space-x-3"
                            >
                              <Checkbox
                                id={q.id}
                                checked={field.value?.includes(q.id)}
                                onCheckedChange={(checked) => {
                                  const current = new Set(field.value || []);
                                  if (checked) {
                                    current.add(q.id);
                                  } else {
                                    current.delete(q.id);
                                  }
                                  field.onChange(Array.from(current));
                                }}
                              />
                              <label htmlFor={q.id} className="text-sm">
                                {q.question}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>
      </Form>
    </Modal>
  );
}
