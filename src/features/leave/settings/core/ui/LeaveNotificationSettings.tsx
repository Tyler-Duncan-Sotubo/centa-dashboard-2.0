"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { useToast } from "@/shared/hooks/use-toast";
import Loading from "@/shared/ui/loading";
import { Input } from "@/shared/ui/input";
import {
  LeaveNotificationSettingsData,
  useLeaveNotificationSettings,
} from "../hooks/use-leave-notification-settings";

export default function LeaveNotificationSettings() {
  const { toast } = useToast();
  const { data, isLoading, isError, updateNotifications } =
    useLeaveNotificationSettings();

  const [notifications, setNotifications] =
    useState<LeaveNotificationSettingsData>({
      notifyHr: false,
      notifyApprover: false,
      notifyLineManager: false,
      notifyEmployeeOnDecision: false,
      notificationCcRoles: [],
      notificationChannels: [],
    });

  // sync server → local state
  useEffect(() => {
    if (!data?.notifications) return;
    setNotifications(data.notifications);
  }, [data]);

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading notifications</p>;

  async function updateLocalAndSave(
    update: Partial<LeaveNotificationSettingsData>,
  ) {
    const next = { ...notifications, ...update };
    setNotifications(next);

    try {
      await updateNotifications(next);
      toast({
        title: "Notification Settings Updated",
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed to update notifications",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="md:w-2/3 mt-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Leave Notifications
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Individual Toggles */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Notify HR</Label>
            <Switch
              checked={notifications.notifyHr}
              onCheckedChange={(val) => updateLocalAndSave({ notifyHr: val })}
            />
          </div>

          <div className="flex justify-between items-center">
            <Label>Notify Approver</Label>
            <Switch
              checked={notifications.notifyApprover}
              onCheckedChange={(val) =>
                updateLocalAndSave({ notifyApprover: val })
              }
            />
          </div>

          <div className="flex justify-between items-center">
            <Label>Notify Line Manager</Label>
            <Switch
              checked={notifications.notifyLineManager}
              onCheckedChange={(val) =>
                updateLocalAndSave({ notifyLineManager: val })
              }
            />
          </div>

          <div className="flex justify-between items-center">
            <Label>Notify Employee When Approved/Rejected</Label>
            <Switch
              checked={notifications.notifyEmployeeOnDecision}
              onCheckedChange={(val) =>
                updateLocalAndSave({ notifyEmployeeOnDecision: val })
              }
            />
          </div>
        </div>

        {/* Channels */}
        <div className="space-y-2">
          <Label htmlFor="channels">
            Notification Channels (comma-separated)
          </Label>
          <Input
            id="channels"
            value={notifications.notificationChannels.join(", ")}
            onChange={(e) => {
              const channels = e.target.value
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean);
              updateLocalAndSave({ notificationChannels: channels });
            }}
          />
        </div>

        {/* CC Roles */}
        <div className="space-y-2">
          <Label htmlFor="cc-roles">CC Roles (comma-separated)</Label>
          <Input
            id="cc-roles"
            value={notifications.notificationCcRoles.join(", ")}
            onChange={(e) => {
              const roles = e.target.value
                .split(",")
                .map((r) => r.trim())
                .filter(Boolean);
              updateLocalAndSave({ notificationCcRoles: roles });
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
