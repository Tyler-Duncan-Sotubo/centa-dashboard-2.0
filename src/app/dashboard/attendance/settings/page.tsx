"use client";

import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import PageHeader from "@/components/pageHeader";
import { FaClock } from "react-icons/fa6";

export default function AttendanceSettings() {
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();

  const [useShifts, setUseShifts] = useState(false);
  const [defaultStartTime, setDefaultStartTime] = useState("09:00");
  const [defaultEndTime, setDefaultEndTime] = useState("17:00");
  const [defaultWorkingDays, setDefaultWorkingDays] = useState(5);
  const [lateToleranceMinutes, setLateToleranceMinutes] = useState(10);
  const [earlyClockInWindowMinutes, setEarlyClockInWindowMinutes] =
    useState(15);
  const [blockOnHoliday, setBlockOnHoliday] = useState(false);
  const [allowOvertime, setAllowOvertime] = useState(false);
  const [overtimeRate, setOvertimeRate] = useState(1.5);
  const [allowHalfDay, setAllowHalfDay] = useState(false);
  const [halfDayDuration, setHalfDayDuration] = useState(4);

  const { isLoading, isError } = useQuery({
    queryKey: ["attendance-settings-options"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/api/attendance-settings/options");
        const data = res.data.data;
        setUseShifts(data.useShifts);
        setDefaultStartTime(data.defaultStartTime);
        setDefaultEndTime(data.defaultEndTime);
        setDefaultWorkingDays(data.defaultWorkingDays);
        setLateToleranceMinutes(data.lateToleranceMinutes);
        setEarlyClockInWindowMinutes(data.earlyClockInWindowMinutes);
        setBlockOnHoliday(data.blockOnHoliday);
        setAllowOvertime(data.allowOvertime);
        setOvertimeRate(data.overtimeRate);
        setAllowHalfDay(data.allowHalfDay);
        setHalfDayDuration(data.halfDayDuration);
        return data;
      } catch (error) {
        if (isAxiosError(error)) return {};
        throw error;
      }
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  async function updateSetting(key: string, value: string | number | boolean) {
    try {
      await axiosInstance.patch(
        "/api/attendance-settings/update",
        { key, value },
        {
          headers: {
            Authorization: `Bearer ${session?.backendTokens?.accessToken}`,
          },
        }
      );
      toast({
        title: "Setting Updated",
        description: key.replace("attendance.", "").replaceAll("_", " "),
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
  if (isError) return <p>Error loading attendance settings</p>;

  return (
    <div className="mb-16 px-4 py-3">
      <PageHeader
        title="Attendance Settings"
        description="Configure attendance settings for your organization"
        icon={<FaClock className="text-2xl" />}
      />
      <Card className="md:w-2/3 mt-10">
        <CardContent className="space-y-6 mt-10">
          <div className="flex justify-between items-center">
            <Label>Use Shifts</Label>
            <Switch
              checked={useShifts}
              onCheckedChange={(val) => {
                setUseShifts(val);
                updateSetting("use_shifts", val);
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Default Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={defaultStartTime}
                onChange={(e) => {
                  setDefaultStartTime(e.target.value);
                  if (debounceTimer.current)
                    clearTimeout(debounceTimer.current);
                  debounceTimer.current = setTimeout(() => {
                    updateSetting("default_start_time", e.target.value);
                  }, 2000);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">Default End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={defaultEndTime}
                onChange={(e) => {
                  setDefaultEndTime(e.target.value);
                  if (debounceTimer.current)
                    clearTimeout(debounceTimer.current);
                  debounceTimer.current = setTimeout(() => {
                    updateSetting("default_end_time", e.target.value);
                  }, 2000);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="working-days">Default Working Days</Label>
              <Input
                id="working-days"
                type="number"
                value={defaultWorkingDays}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDefaultWorkingDays(val);
                  if (debounceTimer.current)
                    clearTimeout(debounceTimer.current);
                  debounceTimer.current = setTimeout(() => {
                    updateSetting("default_working_days", val);
                  }, 2000);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="late-tolerance">Late Tolerance (min)</Label>
              <Input
                id="late-tolerance"
                type="number"
                value={lateToleranceMinutes}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLateToleranceMinutes(val);
                  if (debounceTimer.current)
                    clearTimeout(debounceTimer.current);
                  debounceTimer.current = setTimeout(() => {
                    updateSetting("late_tolerance_minutes", val);
                  }, 2000);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="early-clockin">Early Clock-In Window (min)</Label>
              <Input
                id="early-clockin"
                type="number"
                value={earlyClockInWindowMinutes}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setEarlyClockInWindowMinutes(val);
                  if (debounceTimer.current)
                    clearTimeout(debounceTimer.current);
                  debounceTimer.current = setTimeout(() => {
                    updateSetting("early_clock_in_window_minutes", val);
                  }, 2000);
                }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Label>Block On Public Holiday</Label>
            <Switch
              checked={blockOnHoliday}
              onCheckedChange={(val) => {
                setBlockOnHoliday(val);
                updateSetting("block_on_holiday", val);
              }}
            />
          </div>

          <div className="flex justify-between items-center">
            <Label>Allow Overtime</Label>
            <Switch
              checked={allowOvertime}
              onCheckedChange={(val) => {
                setAllowOvertime(val);
                setTimeout(() => updateSetting("allow_overtime", val), 0);
              }}
            />
          </div>

          {allowOvertime && (
            <div className="space-y-2">
              <Label htmlFor="overtime-rate">Overtime Rate</Label>
              <Input
                id="overtime-rate"
                type="number"
                step="0.1"
                value={overtimeRate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setOvertimeRate(val);
                  if (debounceTimer.current)
                    clearTimeout(debounceTimer.current);
                  debounceTimer.current = setTimeout(() => {
                    updateSetting("overtime_rate", val);
                  }, 2000);
                }}
              />
            </div>
          )}

          <div className="flex justify-between items-center">
            <Label>Allow Half Day</Label>
            <Switch
              checked={allowHalfDay}
              onCheckedChange={(val) => {
                setAllowHalfDay(val);
                updateSetting("allow_half_day", val);
              }}
            />
          </div>

          {allowHalfDay && (
            <div className="space-y-2">
              <Label htmlFor="half-day-duration">Half-Day Duration (hrs)</Label>
              <Input
                id="half-day-duration"
                type="number"
                value={halfDayDuration}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setHalfDayDuration(val);
                  if (debounceTimer.current)
                    clearTimeout(debounceTimer.current);
                  debounceTimer.current = setTimeout(() => {
                    updateSetting("half_day_duration", val);
                  }, 2000);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
