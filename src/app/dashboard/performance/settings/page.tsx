/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";

export default function PerformanceSettings() {
  const { data: session, status } = useSession();
  const axios = useAxiosAuth();
  const { toast } = useToast();

  const [settings, setSettings] = useState<any>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const showSaved = (key: string) => {
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 3000);
  };

  async function updateSetting(key: string, value: any) {
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
  }

  const { isLoading, isError } = useQuery({
    queryKey: ["performance-settings"],
    queryFn: async () => {
      const res = await axios.get("/api/performance-settings");
      setSettings(res.data.data);
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading settings</p>;

  const Saved = ({ k }: { k: string }) =>
    savedKey === k ? (
      <div className="flex items-center gap-1 ml-2">
        <CheckCircle size={16} className="text-green-400" />
        <span className="text-green-400 text-sm">Saved</span>
      </div>
    ) : null;

  return (
    <div className="md:w-2/3 mt-4 mb-20 space-y-10 px-4">
      <div>
        <PageHeader
          title="General Settings"
          description="Configure settings for performance reviews, feedback, and goals."
        />
      </div>
      <div className="space-y-5">
        {/* Auto Create Cycles */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-cycles" className="text-lg">
            Auto Create App Cycles
          </Label>
          <div className="flex items-center">
            <Switch
              id="auto-cycles"
              checked={settings.autoCreateCycles}
              onCheckedChange={(val) => {
                setSettings({ ...settings, autoCreateCycles: val });
                updateSetting("auto_create_cycles", val);
              }}
            />
            <Saved k="auto_create_cycles" />
          </div>
        </div>

        {/* Auto Create Appraisal Cycles */}

        {/* Review Frequency */}
        <div>
          <Label className="mb-3 flex items-center justify-between text-lg ">
            Appraisal Frequency
            <Saved k="review_frequency" />
          </Label>
          <Select
            value={settings.reviewFrequency}
            onValueChange={(val) => {
              setSettings({ ...settings, reviewFrequency: val });
              updateSetting("review_frequency", val);
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

        {/* Enable Self Review */}
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-self" className="text-lg">
            Enable Self Review
          </Label>
          <div className="flex items-center">
            <Switch
              id="enable-self"
              checked={settings.enableSelfReview}
              onCheckedChange={(val) => {
                setSettings({ ...settings, enableSelfReview: val });
                updateSetting("enable_self_review", val);
              }}
            />
            <Saved k="enable_self_review" />
          </div>
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

        {/* Require Rating */}
        <div className="flex items-center justify-between">
          <Label htmlFor="require-rating" className="text-lg">
            Require Rating
          </Label>
          <div className="flex items-center">
            <Switch
              id="require-rating"
              checked={settings.requireReviewRating}
              onCheckedChange={(val) => {
                setSettings({ ...settings, requireReviewRating: val });
                updateSetting("require_review_rating", val);
              }}
            />
            <Saved k="require_review_rating" />
          </div>
        </div>

        {/* Review Score Scale */}
        <div>
          <Label className="mb-3 flex items-center justify-between text-lg ">
            Review Score Scale
            <Saved k="review_score_scale" />
          </Label>
          <Input
            type="number"
            min={1}
            value={settings.reviewScoreScale}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setSettings({ ...settings, reviewScoreScale: val });
              updateSetting("review_score_scale", val);
            }}
          />
        </div>

        {/* Reminder Offset Days */}
        <div>
          <Label className="mb-3 flex items-center justify-between text-lg ">
            Reminder Offset Days
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

        {/* Goal Reminder Frequency */}
        <div>
          <Label className="mb-3 flex items-center justify-between text-lg ">
            Goal Reminder Frequency
            <Saved k="goal_reminder_frequency" />
          </Label>
          <Select
            value={settings.goalReminderFrequency}
            onValueChange={(val) => {
              setSettings({ ...settings, goalReminderFrequency: val });
              updateSetting("goal_reminder_frequency", val);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
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

        {/* (Optional) Add more toggles for array-based values if needed */}
      </div>
    </div>
  );
}
