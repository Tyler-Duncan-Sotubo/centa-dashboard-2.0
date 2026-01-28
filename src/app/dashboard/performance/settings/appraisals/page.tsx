/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { CheckCircle } from "lucide-react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useToast } from "@/shared/hooks/use-toast";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export default function AppraisalSettings() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { toast } = useToast();

  const [settings, setSettings] = useState<any>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const showSaved = (key: string) => {
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 3000);
  };

  const updateSetting = async (
    key: string,
    value: string | number | boolean,
  ) => {
    try {
      await axios.patch("/api/performance-settings/update", { key, value });
      showSaved(key);
    } catch (err: any) {
      toast({
        title: `Failed to update ${key}`,
        variant: "destructive",
        description: err.response?.data?.message || "An error occurred",
      });
    }
  };

  const { isLoading, isError } = useQuery({
    queryKey: ["performance-settings"],
    queryFn: async () => {
      const res = await axios.get("/api/performance-settings");
      setSettings(res.data.data);
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading settings</p>;

  const Saved = ({ k }: { k: string }) =>
    savedKey === k ? (
      <div className="flex items-center gap-1 ml-2">
        <CheckCircle size={16} className="text-green-500" />
        <span className="text-green-500 text-sm">Saved</span>
      </div>
    ) : null;

  return (
    <div className="md:w-2/3 mt-4 mb-20 space-y-10 px-4">
      <PageHeader
        title="Appraisal Settings"
        description="Customize how appraisals behave and who is notified during reviews."
      ></PageHeader>

      <div className="space-y-6 mt-6">
        {/* Auto Create Appraisal Cycles */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-cycles" className="text-lg">
            Auto Create Appraisal Cycles
          </Label>
          <div className="flex items-center">
            <Switch
              id="auto-cycles"
              checked={settings.autoCreateCycles}
              onCheckedChange={(val) => {
                setSettings({ ...settings, autoCreateCycles: val });
                updateSetting("auto_create_appraisals", val);
              }}
            />
            <Saved k="auto_create_appraisals" />
          </div>
        </div>

        {/* Review Frequency */}
        <div>
          <Label className="mb-3 flex items-center justify-between text-lg ">
            Appraisal Frequency
            <Saved k="appraisals_frequency" />
          </Label>
          <Select
            value={settings.appraisalFrequency}
            onValueChange={(val) => {
              setSettings({ ...settings, appraisalFrequency: val });
              updateSetting("appraisals_frequency", val);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="biannual">Biannual</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reminder Offset Days */}
        <div>
          <Label className="mb-2 flex items-center justify-between text-lg ">
            Reminder Offset (Days)
            <Saved k="review_reminder_offset_days" />
          </Label>
          <Input
            type="number"
            min={0}
            value={settings.reviewReminderOffsetDays}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setSettings({ ...settings, reviewReminderOffsetDays: val });
              updateSetting("review_reminder_offset_days", val);
            }}
          />
        </div>

        {/* Default Manager Assignment */}
        <div className="flex items-center justify-between">
          <Label htmlFor="default-manager" className="text-lg">
            Assign Default Manager
          </Label>
          <div className="flex items-center">
            <Switch
              id="default-manager"
              checked={settings.defaultManagerAssignment}
              onCheckedChange={(val) => {
                setSettings({ ...settings, defaultManagerAssignment: val });
                updateSetting("default_manager_assignment", val);
              }}
            />
            <Saved k="default_manager_assignment" />
          </div>
        </div>

        {/* Allow Manager Override */}
        <div className="flex items-center justify-between">
          <Label htmlFor="manager-override" className="text-lg">
            Allow Manager Override
          </Label>
          <div className="flex items-center">
            <Switch
              id="manager-override"
              checked={settings.allowManagerOverride}
              onCheckedChange={(val) => {
                setSettings({ ...settings, allowManagerOverride: val });
                updateSetting("allow_manager_override", val);
              }}
            />
            <Saved k="allow_manager_override" />
          </div>
        </div>

        {/* Auto Finalize Deadline */}
        <div>
          <Label className="mb-2 flex items-center justify-between text-lg">
            Auto Finalize After (Days)
            <Saved k="auto_finalize_deadline_days" />
          </Label>
          <Input
            type="number"
            min={1}
            value={settings.autoFinalizeDeadlineDays || ""}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setSettings({ ...settings, autoFinalizeDeadlineDays: val });
              updateSetting("auto_finalize_deadline_days", val);
            }}
          />
        </div>
      </div>
    </div>
  );
}
