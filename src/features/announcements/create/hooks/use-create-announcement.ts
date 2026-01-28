"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { marked } from "marked";

import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useToast } from "@/shared/hooks/use-toast";

import { announcementSchema } from "@/schema/annoucement.schema";
import type { z } from "zod";
import { CreateAnnouncementElements } from "../../types/create-elements.types";

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;

type UploadImage = {
  name: string;
  type: string;
  base64: string;
} | null;

export function useCreateAnnouncement() {
  const { toast } = useToast();
  const axiosAuth = useAxiosAuth();
  const router = useRouter();
  const { data: session } = useSession();

  const [image, setImage] = useState<UploadImage>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSubmitting, setAiSubmitting] = useState(false);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { isPublished: false },
  });

  const enabled = !!session?.backendTokens?.accessToken;

  const fetchElements =
    useCallback(async (): Promise<CreateAnnouncementElements> => {
      const res = await axiosAuth.get("/api/announcement/create-elements");
      return res.data.data;
    }, [axiosAuth]);

  const elementsQuery = useQuery({
    queryKey: ["announcement", "create-elements"],
    queryFn: fetchElements,
    enabled,
  });

  const createAnnouncement = useCreateMutation({
    endpoint: `/api/announcement`,
    successMessage: "Announcement created successfully",
    refetchKey: "announcements",
    onSuccess: () => router.push("/dashboard/announcement"),
  });

  const generateAnnouncementBody = useCallback(
    async (title: string, category: string): Promise<string> => {
      setAiError(null);
      setAiSubmitting(true);

      try {
        const res = await fetch("/api/generate-body", {
          method: "POST",
          body: JSON.stringify({ title, category }),
          headers: { "Content-Type": "application/json" },
        });

        const json = await res.json();
        return json.body ?? "";
      } catch (err) {
        setAiError("AI generation failed");
        return "";
      } finally {
        setAiSubmitting(false);
      }
    },
    [],
  );

  const applyAiSuggestion = useCallback(async (): Promise<void> => {
    setAiError(null);

    const title = form.getValues("title");
    const categoryId = form.getValues("categoryId");

    if (!title) {
      setAiError("Please enter title first.");
      return;
    }

    const categoryName =
      elementsQuery.data?.categories.find((c) => c.id === categoryId)?.name ??
      "All";

    const aiContent = await generateAnnouncementBody(title, categoryName);

    if (!aiContent) {
      setAiError("AI generation failed");
      return;
    }

    const htmlContent = await marked(aiContent);
    form.setValue("body", htmlContent);
  }, [elementsQuery.data?.categories, form, generateAnnouncementBody]);

  const onSubmit = useCallback(
    async (values: AnnouncementFormValues): Promise<void> => {
      setError(null);

      if (!values.categoryId) {
        toast({
          title: "Category Required",
          description: "Please select a category for the announcement.",
          variant: "destructive",
        });
        return;
      }

      await createAnnouncement(
        { ...values, image: image?.base64 || "" },
        setError,
        form.reset,
      );
    },
    [createAnnouncement, form.reset, image?.base64, toast],
  );

  return useMemo(
    () => ({
      form,
      image,
      setImage,
      error,
      aiError,
      aiSubmitting,
      elementsQuery,
      onSubmit,
      applyAiSuggestion,
      refetchElements: elementsQuery.refetch,
    }),
    [
      form,
      image,
      error,
      aiError,
      aiSubmitting,
      elementsQuery,
      onSubmit,
      applyAiSuggestion,
    ],
  );
}
