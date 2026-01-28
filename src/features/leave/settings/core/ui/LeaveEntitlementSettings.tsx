"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import Loading from "@/shared/ui/loading";
import { useToast } from "@/shared/hooks/use-toast";
import { useLeaveEntitlementSettings } from "../hooks/use-leave-entitlement-settings";

export default function LeaveEntitlementSettings() {
  const { toast } = useToast();
  const { data, isLoading, isError, updateSetting } =
    useLeaveEntitlementSettings();

  const [entitlement, setEntitlement] = useState(0);
  const [carryoverEnabled, setCarryoverEnabled] = useState(false);
  const [carryoverLimit, setCarryoverLimit] = useState(0);
  const [allowNegative, setAllowNegative] = useState(false);

  // sync server → local state
  useEffect(() => {
    if (!data) return;
    setEntitlement(data.defaultAnnualEntitlement ?? 0);
    setCarryoverEnabled(data.allowCarryover ?? false);
    setCarryoverLimit(data.carryoverLimit ?? 0);
    setAllowNegative(data.allowNegativeBalance ?? false);
  }, [data]);

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading entitlement settings</p>;

  async function saveSetting(key: string, value: string | number | boolean) {
    try {
      await updateSetting(key, value);
      toast({
        title: "Setting Updated",
        description: `${key.replaceAll("_", " ")} set.`,
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
              saveSetting("default_annual_entitlement", val);
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
              saveSetting("allow_carryover", val);
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
                saveSetting("carryover_limit", val);
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
              saveSetting("allow_negative_balance", val);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
