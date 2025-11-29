"use client";

import { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export default function LeaveDaysAndEligibilitySettings() {
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();

  const [allowUnconfirmed, setAllowUnconfirmed] = useState(false);
  const [allowedTypes, setAllowedTypes] = useState<string[]>([]);

  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [weekendDays, setWeekendDays] = useState<string[]>([]);
  const [excludeHolidays, setExcludeHolidays] = useState(false);

  const { isLoading, isError } = useQuery({
    queryKey: ["leave-eligibility-days-settings"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          "/api/leave-settings/eligibility-options"
        );
        const data = res.data.data;
        setAllowUnconfirmed(data.allowUnconfirmedLeave ?? false);
        setAllowedTypes(data.allowedLeaveTypesForUnconfirmed ?? []);
        setExcludeWeekends(data.excludeWeekends ?? false);
        setWeekendDays(data.weekendDays ?? []);
        setExcludeHolidays(data.excludePublicHolidays ?? false);
        return data;
      } catch (error) {
        if (isAxiosError(error)) return {};
      }
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  async function updateSetting(
    key: string,
    value: string | number | boolean | string[]
  ) {
    try {
      await axiosInstance.patch("/api/leave-settings/update-leave-setting", {
        key,
        value,
      });
      toast({
        title: "Setting Updated",
        description: key.replace("leave.", "").replaceAll("_", " "),
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed to update setting",
        variant: "destructive",
      });
    }
  }

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading settings</p>;

  return (
    <Card className="md:w-2/3 mt-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Leave Eligibility & Days Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Eligibility */}
        <div className="flex justify-between items-center">
          <Label>Allow Leave for Unconfirmed Employees</Label>
          <Switch
            checked={allowUnconfirmed}
            onCheckedChange={(val) => {
              setAllowUnconfirmed(val);
              updateSetting("allow_unconfirmed_leave", val);
            }}
          />
        </div>

        {allowUnconfirmed && (
          <div className="space-y-2">
            <Label htmlFor="allowed-types">
              Allowed Leave Types (comma separated)
            </Label>
            <Input
              id="allowed-types"
              type="text"
              value={allowedTypes.join(", ")}
              onChange={(e) => {
                const val = e.target.value.split(",").map((t) => t.trim());
                setAllowedTypes(val);

                if (debounceTimer.current) {
                  clearTimeout(debounceTimer.current);
                }

                debounceTimer.current = setTimeout(() => {
                  updateSetting("allowed_leave_types_for_unconfirmed", val);
                }, 2000);
              }}
            />
          </div>
        )}

        {/* Days Settings */}
        <div className="flex justify-between items-center">
          <Label>Exclude Weekends from Leave Days</Label>
          <Switch
            checked={excludeWeekends}
            onCheckedChange={(val) => {
              setExcludeWeekends(val);
              updateSetting("exclude_weekends", val);
            }}
          />
        </div>

        {excludeWeekends && (
          <div className="space-y-2">
            <Label htmlFor="weekend-days">Weekend Days (comma separated)</Label>
            <Input
              id="weekend-days"
              type="text"
              value={weekendDays.join(", ")}
              onChange={(e) => {
                const val = e.target.value.split(",").map((d) => d.trim());
                setWeekendDays(val);

                if (debounceTimer.current) {
                  clearTimeout(debounceTimer.current);
                }

                debounceTimer.current = setTimeout(() => {
                  updateSetting("weekend_days", val);
                }, 2000);
              }}
            />
          </div>
        )}

        <div className="flex justify-between items-center">
          <Label>Exclude Public Holidays</Label>
          <Switch
            checked={excludeHolidays}
            onCheckedChange={(val) => {
              setExcludeHolidays(val);

              if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
              }

              debounceTimer.current = setTimeout(() => {
                updateSetting("exclude_public_holidays", val);
              }, 2000);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
