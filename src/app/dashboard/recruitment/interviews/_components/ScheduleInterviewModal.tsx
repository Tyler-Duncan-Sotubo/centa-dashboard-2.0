"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Modal from "@/components/ui/modal";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { MultiSelect } from "@/components/ui/multi-select";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import ScorecardTemplateSelector from "./ScorecardTemplateSelector";
import EmailTemplateSelector from "./EmailTemplateSelector";

const scheduleSchema = z.object({
  scheduledFor: z.string().min(1, "Required"),
  durationMins: z.coerce.number().min(1, "Must be at least 1"),
  interviewerIds: z.array(z.string()).min(1, "Select at least one interviewer"),
  interviewerEmails: z.array(z.string().email()).optional().default([]), // ensures it's always an array
  scorecardTemplateId: z.string().uuid("Invalid UUID"),
  mode: z.enum(["virtual", "onsite", "phone"]),
  manualLink: z.string().optional(), // for manual links
  emailTemplateId: z.string().uuid("Invalid UUID").optional(), // optional email template ID
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  applicationId: string;
  stage: "phone_screen" | "tech" | "onsite" | "final";
  candidateEmail: string;
  eventId?: string; // Optional prop for existing event ID
  interviewId?: string; // Optional prop for rescheduling
}

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  onSuccess,
  applicationId,
  stage,
  candidateEmail,
  eventId = "", // Default to empty string if not provided
  interviewId,
}: ScheduleInterviewModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const axiosInstance = useAxiosAuth();
  const { data: session, status } = useSession();

  const fetchPipelineTemplates = async () => {
    try {
      const res = await axiosInstance.get(
        "/api/interviews/scorecards-templates"
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const fetchGoogle = async () => {
    try {
      const res = await axiosInstance.get("/api/google");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const fetchEmailTemplates = async () => {
    try {
      const res = await axiosInstance.get("/api/interviews/email-templates");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const fetchCompanyUsers = async () => {
    try {
      const res = await axiosInstance.get("/api/auth/company-users");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
  } = useQuery<
    {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    }[]
  >({
    queryKey: ["user"],
    queryFn: fetchCompanyUsers,
    enabled: !!session?.backendTokens?.accessToken,
  });

  const { data: googleConnected } = useQuery({
    queryKey: ["google"],
    queryFn: fetchGoogle,
    enabled: !!session?.backendTokens.accessToken,
  });

  const {
    data: scoreCards,
    isLoading: isLoadingScoreCards,
    isError,
  } = useQuery({
    queryKey: ["scoreCards"],
    queryFn: () => fetchPipelineTemplates(),
    enabled: !!session?.backendTokens.accessToken,
  });

  const { data: emailTemplates, isLoading: isLoadingEmailTemplates } = useQuery(
    {
      queryKey: ["emailTemplates"],
      queryFn: () => fetchEmailTemplates(),
      enabled: !!session?.backendTokens.accessToken,
    }
  );

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      scheduledFor: "",
      durationMins: 30,
      interviewerIds: [],
      scorecardTemplateId: "",
      mode: "virtual",
    },
  });

  useEffect(() => {
    if (candidateEmail) {
      form.setValue("interviewerEmails", [candidateEmail]); // 👈 pre-fill with candidate's email
    }
  }, [candidateEmail, form]);

  const saveInterview = useCreateMutation({
    endpoint: "/api/interviews/schedule",
    successMessage: "Interview scheduled successfully",
    onSuccess: () => {
      if (onSuccess) onSuccess();
      onClose();
    },
  });

  const rescheduleInterview = useUpdateMutation({
    endpoint: `/api/interviews/${interviewId}/reschedule`,
    successMessage: "Interview rescheduled successfully",
    onSuccess: () => {
      if (onSuccess) onSuccess();
      onClose();
    },
    refetchKey: "candidate-application",
  });

  const onSubmit = async (values: ScheduleFormValues) => {
    setIsLoading(true);

    const selectedInterviewers = users?.filter((i) =>
      values.interviewerIds.includes(i.id)
    );

    const interviewerEmails = [
      candidateEmail, // always include the candidate
      ...(selectedInterviewers ? selectedInterviewers.map((i) => i.email) : []),
    ];

    const payload = {
      applicationId,
      stage,
      scheduledFor: new Date(values.scheduledFor).toISOString(),
      durationMins: values.durationMins,
      interviewerIds: values.interviewerIds, // still storing IDs
      interviewerEmails, // use emails for scheduling
      scorecardTemplateId: values.scorecardTemplateId,
      emailTemplateId: values.emailTemplateId || null, // optional
      mode: values.mode,
    };

    try {
      if (interviewId && eventId) {
        const res = await fetch("/api/integrations/google/reschedule", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            eventId,
          }),
        });

        if (!res.ok) throw new Error("Failed to schedule interview");

        const data = await res.json();

        await rescheduleInterview({
          ...payload,
          meetingLink: data.meetingLink,
          eventId: data.eventId, // Use the updated event IDeventId: data.eventId, // Use the updated event ID
        });
      } else {
        let eventId: string | null = null;
        let meetingLink: string | null = null;
        if (googleConnected && googleConnected.id) {
          const res = await fetch("/api/integrations/google/interview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) throw new Error("Failed to schedule interview");

          const data = await res.json();

          eventId = data.eventId;
          meetingLink = data.meetingLink;
        } else {
          meetingLink = values.manualLink || null;
        }

        await saveInterview({
          ...payload,
          meetingLink: meetingLink ?? null,
          eventId: eventId ?? null,
        });
      }
    } catch (err) {
      console.error("Schedule error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (
    status === "loading" ||
    isLoadingScoreCards ||
    isLoadingEmailTemplates ||
    isLoadingUsers
  )
    return <Loading />;
  if (isError || isErrorUsers) return <p>Error loading data</p>;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={eventId ? "Reschedule Interview" : "Schedule Interview"}
      confirmText="Schedule"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <Form {...form}>
        <form className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="scheduledFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      defaultValue="10:30:00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationMins"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (mins)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} min={1} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="interviewerIds" // <- still storing IDs!
            render={({ field }) => (
              <FormItem className="w-[400px]">
                <FormLabel>Interviewer</FormLabel>
                <FormControl>
                  <MultiSelect
                    placeholder="Select interviewers"
                    options={
                      users
                        ? users.map((interviewer) => ({
                            label: `${interviewer.first_name} ${interviewer.last_name}`,
                            value: interviewer.id,
                          }))
                        : []
                    }
                    selectedOptions={field.value}
                    setSelectedOptions={(selected) => {
                      // Ensure candidate email stays in the list
                      const selectedArray =
                        typeof selected === "function"
                          ? selected(field.value)
                          : selected;
                      const filtered = selectedArray.filter(
                        (email) => email !== candidateEmail
                      );
                      field.onChange([...filtered]);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interviewerEmails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attendees </FormLabel>
                <FormControl>
                  <Input
                    placeholder="john@example.com, jane@example.com"
                    {...field}
                    disabled={!!candidateEmail} // Disable if candidateEmail is provided
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="scorecardTemplateId"
            render={({ field }) => (
              <ScorecardTemplateSelector
                value={field.value}
                onChange={field.onChange}
                scorecards={scoreCards}
              />
            )}
          />

          <FormField
            control={form.control}
            name="emailTemplateId"
            render={({ field }) => (
              <EmailTemplateSelector
                value={field.value}
                onChange={field.onChange}
                templates={emailTemplates}
              />
            )}
          />

          {googleConnected && googleConnected.id ? (
            <p className="text-sm text-muted-foreground font-medium">
              Google Meet link will be generated automatically.
            </p>
          ) : (
            <FormField
              control={form.control}
              name="manualLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://meet.example.com/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interview Mode</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <span>{field.value}</span>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
}
