"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

import { announcementSchema } from "@/schema/annoucement.schema";
import type { z } from "zod";
import { CreateElements } from "../../types/edit-announcement.types";

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;

type AnnouncementApi = AnnouncementFormValues & {
  id: string;
};

export function useEditAnnouncement() {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const enabled = !!session?.backendTokens?.accessToken && !!id;

  const fetchAnnouncement =
    useCallback(async (): Promise<AnnouncementApi | null> => {
      try {
        const res = await axiosAuth.get(`/api/announcement/${id}`);
        return res.data.data.announcement;
      } catch (err) {
        if (isAxiosError(err) && err.response) return null;
        return null;
      }
    }, [axiosAuth, id]);

  const fetchElements =
    useCallback(async (): Promise<CreateElements | null> => {
      try {
        const res = await axiosAuth.get("/api/announcement/create-elements");
        return res.data.data;
      } catch (err) {
        if (isAxiosError(err) && err.response) return null;
        return null;
      }
    }, [axiosAuth]);

  const announcementQuery = useQuery({
    queryKey: ["announcement", id],
    queryFn: fetchAnnouncement,
    enabled,
  });

  const elementsQuery = useQuery({
    queryKey: ["announcement", "create-elements"],
    queryFn: fetchElements,
    enabled: enabled && !!announcementQuery.data,
  });

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: announcementQuery.data ?? undefined,
  });

  useEffect(() => {
    if (announcementQuery.data) {
      form.reset(announcementQuery.data);
    }
  }, [announcementQuery.data, form]);

  const updateAnnouncement = useUpdateMutation({
    endpoint: `/api/announcement/${id}`,
    successMessage: "Announcement updated successfully",
    refetchKey: "announcements",
    onSuccess: () => router.push("/dashboard/announcement"),
  });

  const onSubmit = useCallback(
    async (values: AnnouncementFormValues): Promise<void> => {
      await updateAnnouncement(values);
    },
    [updateAnnouncement],
  );

  const isLoading = announcementQuery.isLoading || elementsQuery.isLoading;
  const isError = announcementQuery.isError || elementsQuery.isError;

  return useMemo(
    () => ({
      id,
      form,
      onSubmit,
      announcement: announcementQuery.data,
      elements: elementsQuery.data,
      isLoading,
      isError,
      refetch: () => {
        announcementQuery.refetch();
        elementsQuery.refetch();
      },
    }),
    [id, form, onSubmit, announcementQuery, elementsQuery, isLoading, isError],
  );
}
