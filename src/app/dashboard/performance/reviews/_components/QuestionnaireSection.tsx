"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useToast } from "@/shared/hooks/use-toast";
import { isAxiosError } from "@/lib/axios";
import StarRatingInput from "./StarRatingInput";
import CommentForm from "./CommentForm";
import { Separator } from "@/shared/ui/separator";

type Question = {
  questionId: string;
  question: string;
  type: "rating" | "yes_no" | "text";
  response?: number | string | null;
  competency?: string;
};

type QuestionnaireFormProps = {
  questions: Record<string, Question[]>; // Grouped by competency name
  assessmentId: string;
  comment?: string;
};

export default function QuestionnaireForm({
  questions,
  assessmentId,
  comment,
}: QuestionnaireFormProps) {
  const axios = useAxiosAuth();
  const { toast } = useToast();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  // Flatten the grouped questions into a single array
  const flatQuestions = Object.values(questions).flat();

  // Create Zod schema dynamically
  const schema = z.object(
    flatQuestions.reduce(
      (acc, q) => {
        acc[q.questionId] =
          q.type === "rating"
            ? z.number().min(0).max(5).or(z.nan())
            : q.type === "yes_no"
              ? z.enum(["yes", "no"])
              : z.string().optional(); // for text
        return acc;
      },
      {} as Record<string, z.ZodTypeAny>,
    ),
  );

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: flatQuestions.reduce((acc, q) => {
      if (q.type === "rating") acc[q.questionId] = q.response ?? 0;
      else if (q.type === "yes_no") acc[q.questionId] = q.response ?? "no";
      else acc[q.questionId] = q.response ?? ""; // text
      return acc;
    }, {} as FormValues),
  });

  const submitResponse = (questionId: string, response: string | number) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.post(
          `/api/assessment-responses/${assessmentId}/save`,
          {
            questionId,
            response: String(response),
          },
        );
        console.log(res);
        if (res.status === 201) {
          queryClient.invalidateQueries({
            queryKey: ["assessment", assessmentId],
          });
        }
        toast({
          title: "Response saved",
          description: "Your response has been saved successfully.",
          variant: "success",
        });
      } catch (error) {
        if (isAxiosError(error) && error.response) {
          toast({
            title: "Submission failed",
            description: `Failed to save response: ${error.message}`,
            variant: "destructive",
          });
        }
      }
    }, 1000);
  };

  return (
    <>
      <Form {...form}>
        <form className="space-y-10 max-w-3xl">
          {Object.entries(questions).map(([competency, groupQuestions]) => (
            <div key={competency}>
              <h3 className="text-xl font-bold mb-3 uppercase">{competency}</h3>

              <Separator className="my-2" />

              <div className="space-y-6">
                {groupQuestions.map((q) => (
                  <FormField
                    key={q.questionId}
                    name={q.questionId}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <h4 className="font-medium text-xmd">{q.question}</h4>
                        <FormControl>
                          {q.type === "rating" ? (
                            <StarRatingInput
                              value={field.value}
                              onChange={(val) => {
                                field.onChange(val);
                                submitResponse(q.questionId, val);
                              }}
                            />
                          ) : q.type === "yes_no" ? (
                            <RadioGroup
                              value={field.value || ""}
                              onValueChange={(val) => {
                                field.onChange(val);
                                submitResponse(q.questionId, val);
                              }}
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="yes"
                                  id={`yes-${q.questionId}`}
                                />
                                <label
                                  htmlFor={`yes-${q.questionId}`}
                                  className="text-xmd"
                                >
                                  Yes
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="no"
                                  id={`no-${q.questionId}`}
                                />
                                <label
                                  htmlFor={`no-${q.questionId}`}
                                  className="text-xmd"
                                >
                                  No
                                </label>
                              </div>
                            </RadioGroup>
                          ) : (
                            <textarea
                              className="w-full mt-2 rounded-md border px-3 py-2 text-sm"
                              rows={4}
                              value={field.value || ""}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                submitResponse(q.questionId, e.target.value);
                              }}
                              placeholder="Enter your response..."
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </form>
      </Form>

      <Separator className="my-8" />

      <CommentForm
        name="questionnaireComment"
        assessmentId={assessmentId}
        comment={comment}
      />
    </>
  );
}
