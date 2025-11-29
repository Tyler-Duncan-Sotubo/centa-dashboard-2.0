"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/components/ui/modal";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { Leave } from "@/types/leave.type";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import { Textarea } from "@/components/ui/textarea";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const leaveFormSchema = z.object({
  review: z.string().min(1, "Notes are required"),
  rejectionReason: z.string().optional(),
});

type LeaveFormType = z.infer<typeof leaveFormSchema>;

interface EditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string | undefined;
}

const EditRequestModal: React.FC<EditRequestModalProps> = ({
  isOpen,
  onClose,
  id,
}) => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const fetchLeaveData = async () => {
    try {
      const res = await axiosInstance.get(`/api/leave-request/${id}`);
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: leaveRequest,
    isLoading,
    error,
  } = useQuery<Leave>({
    queryKey: ["leave-request", id],
    queryFn: () => fetchLeaveData(),
    enabled: !!session?.backendTokens?.accessToken && !!id,
  });

  const form = useForm<LeaveFormType>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      review: "",
    },
  });

  const approveLeave = useUpdateMutation({
    endpoint: `/api/leave-approval/approve/${id}`,
    successMessage: "Leave request approved successfully",
    refetchKey: "leave-data",
  });

  const rejectLeave = useUpdateMutation({
    endpoint: `/api/leave-approval/reject/${id}`,
    successMessage: "Leave request rejected successfully",
    refetchKey: "leave-data",
  });

  const onSubmit = async (data: LeaveFormType) => {
    if (data.review === "approved") {
      await approveLeave();
      onClose();
    } else {
      await rejectLeave();
      onClose();
    }
  };

  const reviews = {
    approved: "approved",
    rejected: "rejected",
  };

  if (status === "loading" || isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div>
        <p>Error</p>
      </div>
    );
  }

  const reviewStatus = form.watch("review");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Leave Request"
      confirmText="Update"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
      disableConfirm={
        leaveRequest?.status === "approved" ||
        leaveRequest?.status === "rejected"
      }
    >
      {(leaveRequest?.status === "approved" ||
        leaveRequest?.status === "rejected") && (
        <p className="text-sm text-error">
          Leave request already {leaveRequest?.status}, you cannot change the
          status.
        </p>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 mt-4 w-full"
        >
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="w-full space-y-6">
              <FormField
                name="review"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder="Select review status"
                            className="w-28"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(reviews).map(([key, value]) => (
                          <SelectItem
                            key={key}
                            value={value}
                            disabled={leaveRequest?.leave_status === "approved"}
                          >
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {reviewStatus === "rejected" && (
                <FormField
                  name="rejectionReason"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea
                          className="h-36 resize-none"
                          {...field}
                          placeholder="Optional reason..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        </form>
      </Form>
    </Modal>
  );
};

export default EditRequestModal;
