"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export default function ProrationSettings() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState<"calendar_days" | "working_days" | null>(
    null
  );

  async function fetchProrationSetting() {
    try {
      const res = await axiosInstance.get(
        "/api/payroll-settings/approval-proration"
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return {};
      }
    }
  }

  const { isLoading, isError } = useQuery({
    queryKey: ["proration-setting"],
    queryFn: async () => {
      const data = await fetchProrationSetting();
      setEnabled(data.enableProration ?? false);
      setMethod(data.prorationMethod || "calendar_days");
      return data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  async function toggleProration() {
    try {
      const newValue = !enabled;
      setEnabled(newValue);

      await axiosInstance.patch(
        "/api/payroll-settings/update-payroll-setting",
        { key: "enable_proration", value: newValue }
      );

      toast({
        title: "Proration Updated",
        description: `Proration has been ${newValue ? "enabled" : "disabled"}.`,
        variant: "success",
      });
    } catch {
      setEnabled(!enabled); // Revert on failure
      toast({
        title: "Failed to update proration setting",
        variant: "destructive",
      });
    }
  }

  async function handleMethodChange(value: "calendar_days" | "working_days") {
    try {
      setMethod(value);
      await axiosInstance.patch(
        "/api/payroll-settings/update-payroll-setting",
        { key: "proration_method", value }
      );

      toast({
        title: "Proration Method Updated",
        description: `Now using ${value.replace("_", " ")}.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed to update method",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="md:w-2/3 mt-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex justify-between items-center gap-2">
          Proration Settings
          <Switch
            id="enable_proration"
            checked={enabled}
            onCheckedChange={toggleProration}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-md text-muted-foreground">
          Proration calculates the amount of salary to be paid when an employee
          joins or leaves mid-month. Choose whether to base this on calendar
          days or working days (Mon–Fri).
        </p>
        {enabled && (
          <div>
            <label className="block mb-1 font-medium">Proration Method</label>
            <Select
              value={method ?? undefined}
              onValueChange={handleMethodChange}
            >
              <SelectTrigger className="w-60">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calendar_days">Calendar Days</SelectItem>
                <SelectItem value="working_days">Working Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
