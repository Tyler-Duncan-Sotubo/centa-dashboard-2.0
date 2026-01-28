"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "@/shared/ui/modal";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/shared/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import Loading from "@/shared/ui/loading";
import { Textarea } from "@/shared/ui/textarea";
import { useLeaveRequest } from "../hooks/use-leave-request";
import { useLeaveReviewActions } from "../hooks/use-leave-review-actions";
import { leaveFormSchema, LeaveFormType } from "../schema/schema";

interface EditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string | undefined;
}

const reviews = [
  { label: "approved", value: "approved" },
  { label: "rejected", value: "rejected" },
] as const;

const EditRequestModal: React.FC<EditRequestModalProps> = ({
  isOpen,
  onClose,
  id,
}) => {
  const leaveQuery = useLeaveRequest(id, isOpen && !!id);
  const { approve, reject } = useLeaveReviewActions(id);

  const form = useForm<LeaveFormType>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: { review: "approved" },
  });

  const reviewStatus = form.watch("review");
  const isFinal =
    leaveQuery.data?.status === "approved" ||
    leaveQuery.data?.status === "rejected";

  const onSubmit = async (values: LeaveFormType) => {
    if (!id) return;

    if (values.review === "approved") {
      await approve();
      onClose();
      return;
    }

    await reject({ rejectionReason: values.rejectionReason });
    onClose();
  };

  if (leaveQuery.sessionStatus === "loading" || leaveQuery.isLoading)
    return <Loading />;

  if (leaveQuery.isError) {
    return (
      <div className="p-6">
        <p>Error loading leave request.</p>
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Leave Request"
      confirmText="Update"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
      disableConfirm={isFinal}
    >
      {isFinal && (
        <p className="text-sm text-error">
          Leave request already {leaveQuery.data?.status}, you cannot change the
          status.
        </p>
      )}

      <Form {...form}>
        <form className="flex flex-col gap-6 mt-4 w-full">
          <FormField
            name="review"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isFinal}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select review status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {reviews.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
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
                      disabled={isFinal}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </form>
      </Form>
    </Modal>
  );
};

export default EditRequestModal;
