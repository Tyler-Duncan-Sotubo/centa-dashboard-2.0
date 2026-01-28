"use client";

import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import type { Announcement } from "@/types/announcements.type";

type Category = { id: string; name: string };

export function useAnnouncementsList() {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();

  const [selectedCategory, setSelectedCategory] = useState("all");

  const enabled = !!session?.backendTokens?.accessToken;

  const fetchAnnouncements = useCallback(async (): Promise<Announcement[]> => {
    try {
      const res = await axiosAuth.get("/api/announcement");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
      return [];
    }
  }, [axiosAuth]);

  const fetchCategories = useCallback(async (): Promise<Category[]> => {
    try {
      const res = await axiosAuth.get("/api/announcement/category");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
      return [];
    }
  }, [axiosAuth]);

  const announcementsQuery = useQuery<Announcement[]>({
    queryKey: ["announcement"],
    queryFn: fetchAnnouncements,
    enabled,
  });

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled,
  });

  const fullCategories = useMemo(() => {
    const categories = categoriesQuery.data ?? [];
    return [{ id: "all", name: "All Announcements" }, ...categories];
  }, [categoriesQuery.data]);

  const filteredAnnouncements = useMemo(() => {
    const data = announcementsQuery.data ?? [];
    if (selectedCategory === "all") return data;
    return data.filter((a: any) => a.categoryId === selectedCategory);
  }, [announcementsQuery.data, selectedCategory]);

  const isLoading = announcementsQuery.isLoading || categoriesQuery.isLoading;
  const isError = announcementsQuery.isError || categoriesQuery.isError;

  const retry = useCallback(() => {
    announcementsQuery.refetch();
    categoriesQuery.refetch();
  }, [announcementsQuery, categoriesQuery]);

  return {
    selectedCategory,
    setSelectedCategory,
    fullCategories,
    filteredAnnouncements,
    isLoading,
    isError,
    retry,
  };
}
