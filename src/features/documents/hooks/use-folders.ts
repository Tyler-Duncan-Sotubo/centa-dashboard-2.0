"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { FolderItem } from "@/features/documents/types/documents.type";

export function useFolders() {
  const { data: session, status } = useSession();
  const axios = useAxiosAuth();
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  const fetchFolders = async (): Promise<FolderItem[]> => {
    try {
      const res = await axios.get("/api/documents/folders");
      return res.data.data ?? [];
    } catch (e) {
      if (isAxiosError(e) && e.response) return [];
      throw e;
    }
  };

  const query = useQuery<FolderItem[]>({
    queryKey: ["folders"],
    queryFn: fetchFolders,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  useEffect(() => {
    if (!activeFolderId && query.data?.length)
      setActiveFolderId(query.data[0].id);
  }, [query.data, activeFolderId]);

  const activeFolder = useMemo(
    () => query.data?.find((f) => f.id === activeFolderId) ?? null,
    [query.data, activeFolderId],
  );

  return {
    status,
    folders: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    activeFolderId,
    setActiveFolderId,
    activeFolder,
    hasAuth: Boolean(session?.backendTokens?.accessToken),
  };
}
