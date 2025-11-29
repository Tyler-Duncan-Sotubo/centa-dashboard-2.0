"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export default function LeaveNotificationSettings() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState({
    notifyHr: false,
    notifyApprover: false,
    notifyLineManager: false,
    notifyEmployeeOnDecision: false,
    notificationCcRoles: [] as string[],
    notificationChannels: [] as string[],
  });

  const { isLoading, isError } = useQuery({
    queryKey: ["leave-notification-settings"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          "/api/leave-settings/notifications"
        );
        const data = res.data.data;
        setNotifications({
          notifyHr: !!data.notifications.notifyHr,
          notifyApprover: !!data.notifications.notifyApprover,
          notifyLineManager: !!data.notifications.notifyLineManager,
          notifyEmployeeOnDecision:
            !!data.notifications.notifyEmployeeOnDecision,
          notificationCcRoles: data.notifications.notificationCcRoles ?? [],
          notificationChannels: data.notifications.notificationChannels ?? [],
        });
        return data;
      } catch (error) {
        if (isAxiosError(error)) return {};
      }
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  async function updateNotifications(update: Partial<typeof notifications>) {
    const newState = { ...notifications, ...update };
    setNotifications(newState);

    try {
      await axiosInstance.patch("/api/leave-settings/update-leave-setting", {
        key: "notifications",
        value: newState,
      });

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

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading notifications</p>;

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
              onCheckedChange={(val) => updateNotifications({ notifyHr: val })}
            />
          </div>

          <div className="flex justify-between items-center">
            <Label>Notify Approver</Label>
            <Switch
              checked={notifications.notifyApprover}
              onCheckedChange={(val) =>
                updateNotifications({ notifyApprover: val })
              }
            />
          </div>

          <div className="flex justify-between items-center">
            <Label>Notify Line Manager</Label>
            <Switch
              checked={notifications.notifyLineManager}
              onCheckedChange={(val) =>
                updateNotifications({ notifyLineManager: val })
              }
            />
          </div>

          <div className="flex justify-between items-center">
            <Label>Notify Employee When Approved/Rejected</Label>
            <Switch
              checked={notifications.notifyEmployeeOnDecision}
              onCheckedChange={(val) =>
                updateNotifications({ notifyEmployeeOnDecision: val })
              }
            />
          </div>
        </div>

        {/* Optional: Channels (email, sms, etc.) */}
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
              updateNotifications({ notificationChannels: channels });
            }}
          />
        </div>

        {/* Optional: CC Roles */}
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
              updateNotifications({ notificationCcRoles: roles });
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
