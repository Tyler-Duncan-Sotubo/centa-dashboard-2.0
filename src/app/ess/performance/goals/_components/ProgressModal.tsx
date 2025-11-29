import Modal from "@/components/ui/modal";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useForm } from "react-hook-form";

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
  const { register, handleSubmit, setValue, watch } = useForm<ProgressFormData>(
    {
      defaultValues: { progress: 0, note: "" },
    }
  );

  const progress = watch("progress");

  const updateProgress = useCreateMutation({
    endpoint: `/api/performance-goals/${goalId}/progress`,
    successMessage: "Progress updated successfully",
    refetchKey: "goal",
  });

  const onSubmit = (data: ProgressFormData) => {
    updateProgress(data);
    onClose();
  };

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
          <p className="text-sm mb-4">Progress: {progress}%</p>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[progress]}
            onValueChange={(val) => setValue("progress", val[0])}
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
