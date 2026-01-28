import { useState } from "react";
import { FaFileAlt, FaCloudUploadAlt } from "react-icons/fa";
import { Button } from "@/shared/ui/button";
import { ProgressModal } from "./ProgressModal";
import { AttachmentModal } from "./AttachmentModal";

export default function GoalActionButtons({ goalId }: { goalId: string }) {
  const [showProgress, setShowProgress] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button className="w-full" onClick={() => setShowProgress(true)}>
          <FaFileAlt className="mr-2" />
          Add Progress Update
        </Button>

        <Button className="w-full" onClick={() => setShowAttachment(true)}>
          <FaCloudUploadAlt className="mr-2" />
          Upload Attachment
        </Button>
      </div>

      <ProgressModal
        isOpen={showProgress}
        onClose={() => setShowProgress(false)}
        goalId={goalId}
      />
      <AttachmentModal
        isOpen={showAttachment}
        onClose={() => setShowAttachment(false)}
        goalId={goalId}
      />
    </>
  );
}
