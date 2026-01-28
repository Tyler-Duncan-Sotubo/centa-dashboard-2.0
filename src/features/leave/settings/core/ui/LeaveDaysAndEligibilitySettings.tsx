"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
import Loading from "@/shared/ui/loading";
import { useToast } from "@/shared/hooks/use-toast";
import { useLeaveEligibilityDaysSettings } from "../hooks/use-leave-eligibility-days-settings";

export default function LeaveDaysAndEligibilitySettings() {
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const { data, isLoading, isError, updateSetting } =
    useLeaveEligibilityDaysSettings();

  const [allowUnconfirmed, setAllowUnconfirmed] = useState(false);
  const [allowedTypes, setAllowedTypes] = useState<string[]>([]);
  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [weekendDays, setWeekendDays] = useState<string[]>([]);
  const [excludeHolidays, setExcludeHolidays] = useState(false);

  /** sync server → local state */
  useEffect(() => {
    if (!data) return;
    setAllowUnconfirmed(data.allowUnconfirmedLeave);
    setAllowedTypes(data.allowedLeaveTypesForUnconfirmed);
    setExcludeWeekends(data.excludeWeekends);
    setWeekendDays(data.weekendDays);
    setExcludeHolidays(data.excludePublicHolidays);
  }, [data]);

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading settings</p>;

  function debounceUpdate(key: string, value: any) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        await updateSetting(key, value);
        toast({
          title: "Setting Updated",
          variant: "success",
        });
      } catch {
        toast({
          title: "Failed to update setting",
          variant: "destructive",
        });
      }
    }, 2000);
  }

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
              debounceUpdate("allow_unconfirmed_leave", val);
            }}
          />
        </div>

        {allowUnconfirmed && (
          <div className="space-y-2">
            <Label>Allowed Leave Types (comma separated)</Label>
            <Input
              value={allowedTypes.join(", ")}
              onChange={(e) => {
                const val = e.target.value.split(",").map((t) => t.trim());
                setAllowedTypes(val);
                debounceUpdate("allowed_leave_types_for_unconfirmed", val);
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
              debounceUpdate("exclude_weekends", val);
            }}
          />
        </div>

        {excludeWeekends && (
          <div className="space-y-2">
            <Label>Weekend Days (comma separated)</Label>
            <Input
              value={weekendDays.join(", ")}
              onChange={(e) => {
                const val = e.target.value.split(",").map((d) => d.trim());
                setWeekendDays(val);
                debounceUpdate("weekend_days", val);
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
              debounceUpdate("exclude_public_holidays", val);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
