"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import Loading from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import QuestionTableWithDrag from "./QuestionTableWithDrag";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import PageHeader from "@/components/pageHeader";
import { FaCirclePlus } from "react-icons/fa6";
import FeedbackQuestionModal from "./CreateFeedbackQuestionModal";

type Question = {
  id: string;
  type: string;
  question: string;
  inputType: string;
  order: number;
  isActive: boolean;
  createdAt: string;
};

export default function FeedbackQuestionManager() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const [selectedType, setSelectedType] = useState<string | null>("self");
  const [open, setOpen] = useState(false);

  const updateOrder = useUpdateMutation({
    endpoint: `/api/feedback-questions/reorder/${selectedType}`,
    successMessage: "Order saved",
    refetchKey: "feedback-questions",
  });

  const handleReorder = async (updated: Question[]) => {
    updateOrder({
      questions: updated.map(({ id, order }) => ({ id, order })),
    });
  };

  const {
    data: questions,
    isLoading,
    isError,
  } = useQuery<Question[]>({
    queryKey: ["feedback-questions"],
    queryFn: async () => {
      const res = await axios.get("/api/feedback-questions");
      return res.data.data;
    },
    enabled: !!session?.backendTokens.accessToken,
  });

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading questions.</p>;

  const types = Array.from(new Set(questions?.map((q) => q.type)));

  const selectedQuestions =
    selectedType && questions
      ? questions.filter((q) => q.type === selectedType)
      : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl  mt-10">
      {/* Left Column: Type List */}
      <div className="h-full max-h-[70vh] border md:col-span-1">
        <div className="space-y-2">
          {types.map((type) => (
            <Button
              key={type}
              variant="ghost"
              className={cn(
                "w-full justify-start capitalize rounded-none text-left p-3",
                selectedType === type && "bg-muted font-semibold"
              )}
              onClick={() => setSelectedType(type)}
            >
              {type.replace(/_/g, " ")}
              <span className="text-md text-white px-2 py-1 muted-foreground ml-auto font-bold bg-monzo-background">
                {questions?.filter((q) => q.type === type).length}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Right Column: Questions Table */}
      <div className="md:col-span-3 space-y-4">
        <PageHeader
          title={
            selectedType ? selectedType.replace(/_/g, " ") : "Select a type"
          }
          description="Manage feedback questions for the selected type."
        >
          <Button onClick={() => setOpen(true)} className="mb-2">
            <FaCirclePlus className="mr-2" />
            Add Question
          </Button>
        </PageHeader>
        {selectedQuestions.length > 0 ? (
          <QuestionTableWithDrag
            questions={selectedQuestions}
            onReorder={handleReorder}
          />
        ) : (
          <p className="text-muted-foreground">
            No questions available for this type.
          </p>
        )}
        <FeedbackQuestionModal
          open={open}
          setOpen={setOpen}
          selectedType={selectedType}
          order={selectedQuestions.length ? selectedQuestions.length + 1 : 0}
        />
      </div>
    </div>
  );
}
