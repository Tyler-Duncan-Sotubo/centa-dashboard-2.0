"use client";

import { useEffect, useState } from "react";
import { Label } from "@/shared/ui/label";
import { useSession } from "next-auth/react";
import { useToast } from "@/shared/hooks/use-toast";
import { Card, CardHeader, CardContent, CardTitle } from "@/shared/ui/card";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export default function DefaultManagerSettings() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();
  const [fallbackManagerId, setFallbackManagerId] = useState<string | null>(
    null,
  );

  async function fetchFallBackManager() {
    const res = await axiosInstance.get(
      "/api/company-settings/default-manager",
    );
    return res.data.data; // expected: [{ id, name }]
  }

  async function fetchManagers() {
    const res = await axiosInstance.get("/api/employees/fallback-managers");
    return res.data.data; // expected: [{ id, name }]
  }

  const { data: existingManager, isLoading: existingManagerLoading } = useQuery(
    {
      queryKey: ["existing-fallback-manager"],
      queryFn: fetchFallBackManager,
      enabled: !!session?.backendTokens?.accessToken,
    },
  );

  useEffect(() => {
    if (existingManager) {
      setFallbackManagerId(existingManager.defaultManager);
    }
  }, [existingManager]);

  const { data: managers, isLoading } = useQuery({
    queryKey: ["fallback-managers"],
    queryFn: fetchManagers,
    enabled: !!session?.backendTokens?.accessToken,
  });

  async function updateFallbackManager(managerId: string) {
    try {
      setFallbackManagerId(managerId);

      await axiosInstance.patch(
        "/api/company-settings/default-manager",
        { key: "default_manager_id", value: managerId },
        {
          headers: {
            Authorization: `Bearer ${session?.backendTokens?.accessToken}`,
          },
        },
      );

      toast({
        title: "Fallback Manager Set",
        description: "Default fallback manager saved.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed to update fallback manager",
        variant: "destructive",
      });
    }
  }

  if (status === "loading" || isLoading || existingManagerLoading) {
    return <Loading />;
  }

  return (
    <Card className="md:w-2/3">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex justify-between items-center gap-2"></CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-lg font-medium">
            Default Fallback Manager
            <span className="text-md text-muted-foreground block">
              Used if no direct line manager is assigned during upload
            </span>
          </Label>
          <Select
            value={fallbackManagerId || ""}
            onValueChange={(value) => updateFallbackManager(value)}
          >
            <SelectTrigger className="mt-3 border p-2 rounded w-full">
              <SelectValue placeholder="Select fallback manager" />
            </SelectTrigger>
            <SelectContent>
              {managers?.map((m: { id: string; name: string }) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
