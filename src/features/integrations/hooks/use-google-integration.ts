"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";

export type GoogleIntegration = { id?: string } | null;

export function useGoogleIntegration() {
  const { data: session, status } = useSession();
  const axios = useAxiosAuth();

  const query = useQuery<GoogleIntegration>({
    queryKey: ["google"],
    enabled: Boolean(session?.backendTokens?.accessToken),
    queryFn: async () => {
      try {
        const res = await axios.get("/api/google");
        return res.data.data ?? null;
      } catch (err) {
        if (isAxiosError(err) && err.response) return null;
        throw err;
      }
    },
  });

  const connect = useCallback(async () => {
    const res = await fetch("/api/integrations/google");
    const { url } = (await res.json()) as { url: string };
    window.location.href = url;
  }, []);

  return { sessionStatus: status, ...query, connect };
}
