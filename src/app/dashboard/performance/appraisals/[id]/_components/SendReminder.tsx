import { Button } from "@/shared/ui/button";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import React from "react";
import { IoIosSend } from "react-icons/io";

const SendReminder = ({ employeeId }: { employeeId: string }) => {
  const handleSendReminder = useCreateMutation({
    endpoint: `/api/appraisals/${employeeId}/reminder`,
    successMessage: "Reminder sent successfully",
    refetchKey: "appraisal_participants",
  });

  return (
    <div className="flex justify-center">
      <Button size="sm" variant="outline" onClick={() => handleSendReminder()}>
        <IoIosSend />
      </Button>
    </div>
  );
};

export default SendReminder;
