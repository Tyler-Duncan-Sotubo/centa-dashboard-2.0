"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export type OfficeLocation = {
  id: string;
  name: string;
  country: string;
  street: string;
  city: string;
  state: string;
  longitude: string;
  latitude: string;
};

export function useOfficeLocationsQuery() {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();

  return useQuery<OfficeLocation[]>({
    queryKey: ["office-locations"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      try {
        const res = await axiosAuth.get("/api/locations");
        return res.data.data as OfficeLocation[];
      } catch (error) {
        if (isAxiosError(error)) return [];
        throw error;
      }
    },
  });
}
