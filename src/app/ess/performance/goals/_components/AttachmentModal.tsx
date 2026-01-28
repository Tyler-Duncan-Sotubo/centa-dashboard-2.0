import { FileUploader } from "@/shared/ui/file-uploader";
import Modal from "@/shared/ui/modal";
import { Textarea } from "@/shared/ui/textarea";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/shared/hooks/use-toast";

type AttachmentFormData = {
  file: FileList;
  comment: string;
};

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: string | number;
  id?: string;
}

export function AttachmentModal({
  isOpen,
  onClose,
  goalId,
  id,
}: AttachmentModalProps) {
  const { register, handleSubmit } = useForm<AttachmentFormData>();
  const [file, setFile] = useState<{
    name: string;
    type: string;
    base64: string;
  } | null>(null);
  const { toast } = useToast();

  const addAttachment = useCreateMutation({
    endpoint: `/api/performance-goals/${goalId}/attachments`,
    successMessage: "Attachment added successfully",
    refetchKey: "goal",
  });

  const updateAttachment = useUpdateMutation({
    endpoint: `/api/performance-goals/attachments/${id}`,
    successMessage: "Attachment updated successfully",
    refetchKey: "goal",
  });

  const onSubmit = (data: AttachmentFormData) => {
    if (data.comment.length === 0) {
      toast({
        title: "Comment is required",
        description: "Please add a comment for the attachment.",
        variant: "destructive",
      });
      return;
    }
    if (id) {
      updateAttachment({ file, comment: data.comment });
    } else {
      addAttachment({ file, comment: data.comment });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Attachment"
      confirmText="Upload"
      onConfirm={handleSubmit(onSubmit)}
    >
      <div className="space-y-4 pt-4">
        <FileUploader value={file} onChange={setFile} label="Upload Receipt" />
        <Textarea
          {...register("comment")}
          placeholder="Add a comment..."
          required
          className="resize-none h-36"
        />
      </div>
    </Modal>
  );
}
