"use client";

import { useState } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { FaClock } from "react-icons/fa6";
import type { AttendanceSettings } from "../types/attendance-settings.type";
import { useAttendanceSettingsQuery } from "../hooks/use-attendance-settings-query";
import { useUpdateAttendanceSetting } from "../hooks/use-update-attendance-setting";
import { useDebouncedSetting } from "../hooks/use-debounced-setting";

export function AttendanceSettingsView() {
  const { runDebounced } = useDebouncedSetting(2000);
  const { updateAttendanceSetting } = useUpdateAttendanceSetting();

  const [s, setS] = useState<AttendanceSettings>({
    useShifts: false,
    defaultStartTime: "09:00",
    defaultEndTime: "17:00",
    defaultWorkingDays: 5,
    lateToleranceMinutes: 10,
    earlyClockInWindowMinutes: 15,
    blockOnHoliday: false,
    allowOvertime: false,
    overtimeRate: 1.5,
    allowHalfDay: false,
    halfDayDuration: 4,
  });

  const { isLoading, isError } = useAttendanceSettingsQuery((settings) =>
    setS(settings),
  );

  if (isLoading) return <Loading />;
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
              checked={s.useShifts}
              onCheckedChange={(val) => {
                setS((p) => ({ ...p, useShifts: val }));
                updateAttendanceSetting("use_shifts", val);
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Default Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={s.defaultStartTime}
                onChange={(e) => {
                  const v = e.target.value;
                  setS((p) => ({ ...p, defaultStartTime: v }));
                  runDebounced(() =>
                    updateAttendanceSetting("default_start_time", v),
                  );
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">Default End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={s.defaultEndTime}
                onChange={(e) => {
                  const v = e.target.value;
                  setS((p) => ({ ...p, defaultEndTime: v }));
                  runDebounced(() =>
                    updateAttendanceSetting("default_end_time", v),
                  );
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="working-days">Default Working Days</Label>
              <Input
                id="working-days"
                type="number"
                value={s.defaultWorkingDays}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setS((p) => ({ ...p, defaultWorkingDays: v }));
                  runDebounced(() =>
                    updateAttendanceSetting("default_working_days", v),
                  );
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="late-tolerance">Late Tolerance (min)</Label>
              <Input
                id="late-tolerance"
                type="number"
                value={s.lateToleranceMinutes}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setS((p) => ({ ...p, lateToleranceMinutes: v }));
                  runDebounced(() =>
                    updateAttendanceSetting("late_tolerance_minutes", v),
                  );
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="early-clockin">Early Clock-In Window (min)</Label>
              <Input
                id="early-clockin"
                type="number"
                value={s.earlyClockInWindowMinutes}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setS((p) => ({ ...p, earlyClockInWindowMinutes: v }));
                  runDebounced(() =>
                    updateAttendanceSetting("early_clock_in_window_minutes", v),
                  );
                }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Label>Block On Public Holiday</Label>
            <Switch
              checked={s.blockOnHoliday}
              onCheckedChange={(val) => {
                setS((p) => ({ ...p, blockOnHoliday: val }));
                updateAttendanceSetting("block_on_holiday", val);
              }}
            />
          </div>

          <div className="flex justify-between items-center">
            <Label>Allow Overtime</Label>
            <Switch
              checked={s.allowOvertime}
              onCheckedChange={(val) => {
                setS((p) => ({ ...p, allowOvertime: val }));
                updateAttendanceSetting("allow_overtime", val);
              }}
            />
          </div>

          {s.allowOvertime && (
            <div className="space-y-2">
              <Label htmlFor="overtime-rate">Overtime Rate</Label>
              <Input
                id="overtime-rate"
                type="number"
                step="0.1"
                value={s.overtimeRate}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setS((p) => ({ ...p, overtimeRate: v }));
                  runDebounced(() =>
                    updateAttendanceSetting("overtime_rate", v),
                  );
                }}
              />
            </div>
          )}

          <div className="flex justify-between items-center">
            <Label>Allow Half Day</Label>
            <Switch
              checked={s.allowHalfDay}
              onCheckedChange={(val) => {
                setS((p) => ({ ...p, allowHalfDay: val }));
                updateAttendanceSetting("allow_half_day", val);
              }}
            />
          </div>

          {s.allowHalfDay && (
            <div className="space-y-2">
              <Label htmlFor="half-day-duration">Half-Day Duration (hrs)</Label>
              <Input
                id="half-day-duration"
                type="number"
                value={s.halfDayDuration}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setS((p) => ({ ...p, halfDayDuration: v }));
                  runDebounced(() =>
                    updateAttendanceSetting("half_day_duration", v),
                  );
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
