// DynamicFeedbackForm.tsx

import { FormItem, FormLabel, FormControl } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Separator } from "@/shared/ui/separator";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import Loading from "@/shared/ui/loading";
import { useSession } from "next-auth/react";

type FeedbackQuestion = {
  id: string;
  question: string;
  inputType: "text" | "textarea" | "file";
  order: number;
  required?: boolean;
};

type Props = {
  type: "self" | "peer" | "manager_to_employee" | "employee_to_manager";
  responses: Record<string, string>;
  setResponses: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

export default function DynamicFeedbackForm({
  type,
  responses,
  setResponses,
}: Props) {
  const axios = useAxiosAuth();
  const { data: session } = useSession();

  const { data: questions = [], isLoading } = useQuery<FeedbackQuestion[]>({
    queryKey: ["feedback-questions", type],
    queryFn: async () => {
      const res = await axios.get(`/api/feedback-questions/type/${type}`);
      return res.data.data;
    },
    enabled: Boolean(session?.backendTokens?.accessToken) && !!type,
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Feedback Questions</h3>
      <Separator />
      {questions
        .sort((a, b) => a.order - b.order)
        .map((q) => (
          <FormItem key={q.id}>
            <FormLabel required={q.required}>{q.question}</FormLabel>
            <FormControl>
              {q.inputType === "textarea" ? (
                <Textarea
                  value={responses[q.id] ?? ""}
                  onChange={(e) =>
                    setResponses((prev) => ({
                      ...prev,
                      [q.id]: e.target.value,
                    }))
                  }
                />
              ) : (
                <Input
                  value={responses[q.id] ?? ""}
                  onChange={(e) =>
                    setResponses((prev) => ({
                      ...prev,
                      [q.id]: e.target.value,
                    }))
                  }
                />
              )}
            </FormControl>
          </FormItem>
        ))}
    </div>
  );
}
