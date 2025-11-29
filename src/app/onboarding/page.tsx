"use client";

import Loading from "@/components/ui/loading";
import { useEffect, useMemo, useState } from "react";
import { useOnboardingData } from "./_components/useOnboardingData";
import Sidebar from "./_components/Sidebar";
import StepForm from "./_components/StepForm";
import { useSession } from "next-auth/react";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/pageHeader";

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data, loading } = useOnboardingData();

  // Index-based navigation (0..n-1)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Completed & answers keyed by checklist item id (stable)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [answersById, setAnswersById] = useState<
    Record<string, Record<string, unknown>>
  >({});

  const sendOnboardingData = useCreateMutation({
    endpoint: "/api/onboarding/employee",
    successMessage: "Onboarding data sent successfully.",
    refetchKey: "onboarding",
    onSuccess: () => {
      router.push("/auth/login");
    },
  });

  /**
   * Build the visible checklist:
   * - Keep only steps that actually have fields (if that's desired)
   * - Sort by `order`, but navigate by index to avoid off-by-one issues
   */
  const checklist = useMemo(() => {
    return [...(data?.checklist ?? [])]
      .filter((item) => (item.fields?.length ?? 0) > 0)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [data?.checklist]);

  // Ensure currentIndex is valid whenever checklist changes
  useEffect(() => {
    if (currentIndex >= checklist.length) {
      setCurrentIndex(0);
    }
  }, [checklist, currentIndex]);

  if (loading) return <Loading />;
  if (!data) return <p className="p-8 text-red-600">Failed to load.</p>;

  if (checklist.length === 0) {
    return <p className="p-8">No onboarding steps available.</p>;
  }

  const current = checklist[currentIndex];
  const totalSteps = checklist.length;
  const isLast = currentIndex === totalSteps - 1;

  /**
   * Persist the current step’s answers, then either advance
   * or submit the entire payload.
   */
  const persistStep = async (answers: Record<string, unknown>) => {
    const stepId = current.id;

    const updatedAnswersById = {
      ...answersById,
      [stepId]: answers,
    };
    setAnswersById(updatedAnswersById);

    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });

    // Merge all answers into a single payload
    const mergedAnswers = Object.assign(
      {},
      ...Object.values(updatedAnswersById)
    );

    if (isLast) {
      await sendOnboardingData({
        ...mergedAnswers,
        employeeId: session?.user.id,
      });
    } else {
      setCurrentIndex((i) => Math.min(totalSteps - 1, i + 1));
    }
  };

  const handlePrev = () => setCurrentIndex((i) => Math.max(0, i - 1));

  return (
    <div className="flex h-screen">
      <Sidebar
        checklist={checklist}
        currentIndex={currentIndex}
        jump={setCurrentIndex}
        completedIds={completedIds}
      />

      <main className="flex-1 flex flex-col bg-white py-6">
        <div className="px-5 mb-2">
          <PageHeader
            title="Start Your Journey with Us"
            description="Complete the steps below to onboard successfully."
          />
        </div>
        <div className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="flex items-center gap-3 px-4 py-3 md:hidden">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Step {currentIndex + 1} of {totalSteps}
              </p>
              <p className="text-base font-semibold line-clamp-1">
                {current.title}
              </p>

              {/* Tiny progress bar */}
              <div className="mt-2 h-1 w-full rounded bg-muted">
                <div
                  className="h-1 rounded bg-monzo-brand transition-[width]"
                  style={{
                    width: `${((currentIndex + 1) / totalSteps) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-5 py-6 bg-white">
          <h3 className="hidden md:block text-xl font-semibold mb-6">
            Step {currentIndex + 1} / {totalSteps}: {current.title}
          </h3>

          <StepForm
            item={current}
            maxStep={totalSteps} // If StepForm needs a count
            onPrev={handlePrev}
            onNext={persistStep}
          />
        </div>
      </main>
    </div>
  );
}
