import Modal from "@/shared/ui/modal";
import { Slider } from "@/shared/ui/slider";
import { Textarea } from "@/shared/ui/textarea";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useEffect } from "react";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: string | number;
}

type ProgressFormData = {
  progress: number;
  note: string;
};

export function ProgressModal({ isOpen, onClose, goalId }: ProgressModalProps) {
  const { register, handleSubmit, setValue, watch, reset } =
    useForm<ProgressFormData>({
      defaultValues: { progress: 0, note: "" },
    });

  const progress = watch("progress");
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  // Fetch latest progress when modal opens
  const {
    data: latestProgress,
    isLoading: loadingLatest,
    isFetching: fetchingLatest,
  } = useQuery({
    queryKey: ["goal-latest-progress", goalId],
    queryFn: async () => {
      const res = await axios.get(`/api/performance-goals/${goalId}/progress`);
      const value =
        typeof res.data.data === "number"
          ? res.data.data
          : (res.data.data?.progress ?? 0);
      return value as number;
    },
    enabled: !!session?.backendTokens?.accessToken && !!goalId && isOpen,
    // optional: avoid refetch loops when sliding
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  // Seed the slider when latest progress arrives or when modal opens
  useEffect(() => {
    if (isOpen) {
      reset((prev) => ({ ...prev, note: prev.note ?? "" }));
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (typeof latestProgress === "number") {
      setValue("progress", latestProgress);
    }
  }, [latestProgress, setValue]);

  const updateProgress = useCreateMutation({
    endpoint: `/api/performance-goals/${goalId}/progress`,
    successMessage: "Progress updated successfully",
    refetchKey: "goal",
  });

  const onSubmit = (data: ProgressFormData) => {
    updateProgress(data);
    onClose();
  };

  const sliderDisabled = loadingLatest || fetchingLatest;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Progress Update"
      confirmText="Submit"
      onConfirm={handleSubmit(onSubmit)}
    >
      <div className="space-y-4 pt-4">
        <div>
          <p className="text-sm mb-4">
            Progress: {progress}%
            {sliderDisabled && (
              <span className="ml-2 opacity-60">(loading…)</span>
            )}
          </p>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[progress]}
            onValueChange={(val) => setValue("progress", val[0])}
            disabled={sliderDisabled}
          />
        </div>

        <Textarea
          {...register("note")}
          placeholder="Optional note..."
          className="resize-none h-36"
        />
      </div>
    </Modal>
  );
}
