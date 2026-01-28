"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { AnnouncementDetail } from "../../types/announcement-detail.types";

export function useAnnouncementDetail() {
  const axiosAuth = useAxiosAuth();
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();

  const fetchAnnouncement = async (): Promise<AnnouncementDetail | null> => {
    try {
      const res = await axiosAuth.get(`/api/announcement/${id}`);
      return res.data.data as AnnouncementDetail;
    } catch (error) {
      if (isAxiosError(error) && error.response) return null;
      return null;
    }
  };

  const query = useQuery({
    queryKey: ["announcement-detail", id],
    queryFn: fetchAnnouncement,
    enabled: !!session?.backendTokens?.accessToken && !!id,
  });

  return {
    id,
    ...query,
  };
}
