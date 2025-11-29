"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export default function LeaveEntitlementSettings() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();

  const [entitlement, setEntitlement] = useState(0);
  const [carryoverEnabled, setCarryoverEnabled] = useState(false);
  const [carryoverLimit, setCarryoverLimit] = useState(0);
  const [allowNegative, setAllowNegative] = useState(false);

  async function fetchLeaveEntitlementSettings() {
    try {
      const res = await axiosInstance.get("/api/leave-settings/entitlement");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return {};
      }
    }
  }

  const { isLoading, isError } = useQuery({
    queryKey: ["leave-entitlement-settings"],
    queryFn: async () => {
      const data = await fetchLeaveEntitlementSettings();
      setEntitlement(data.defaultAnnualEntitlement ?? 0);
      setCarryoverEnabled(data.allowCarryover ?? false);
      setCarryoverLimit(data.carryoverLimit ?? 0);
      setAllowNegative(data.allowNegativeBalance ?? false);
      return data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading entitlement settings</p>;

  async function updateSetting(key: string, value: string | number | boolean) {
    try {
      await axiosInstance.patch("/api/leave-settings/update-leave-setting", {
        key,
        value,
      });

      toast({
        title: "Setting Updated",
        description: `${key.replace("leave.", "").replaceAll("_", " ")} set.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed to update setting",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="md:w-2/3 mt-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Leave Entitlement
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="annual-entitlement">
            Annual Leave Entitlement (days)
          </Label>
          <Input
            id="annual-entitlement"
            type="number"
            min={0}
            value={entitlement}
            onChange={(e) => {
              const val = Number(e.target.value);
              setEntitlement(val);
              updateSetting("default_annual_entitlement", val);
            }}
            className="w-24"
          />
        </div>

        <div className="flex justify-between items-center">
          <Label htmlFor="allow-carryover">
            Allow Carryover of Unused Leave
          </Label>
          <Switch
            id="allow-carryover"
            checked={carryoverEnabled}
            onCheckedChange={(val) => {
              setCarryoverEnabled(val);
              updateSetting("allow_carryover", val);
            }}
          />
        </div>

        {carryoverEnabled && (
          <div className="space-y-2">
            <Label htmlFor="carryover-limit">Carryover Limit (days)</Label>
            <Input
              id="carryover-limit"
              type="number"
              min={0}
              value={carryoverLimit}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCarryoverLimit(val);
                updateSetting("carryover_limit", val);
              }}
              className="w-24"
            />
          </div>
        )}

        <div className="flex justify-between items-center">
          <Label htmlFor="allow-negative">Allow Negative Leave Balance</Label>
          <Switch
            id="allow-negative"
            checked={allowNegative}
            onCheckedChange={(val) => {
              setAllowNegative(val);
              updateSetting("allow_negative_balance", val);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
