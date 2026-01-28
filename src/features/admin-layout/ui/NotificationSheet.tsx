"use client";

import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaRegBell } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import pusherClient from "@/lib/pusher";
import GenericSheet from "@/shared/ui/generic-sheet";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Button } from "@/shared/ui/button";

// Notification type
interface Notification {
  id: number;
  message: string;
  url: string;
  read: boolean;
}

const NotificationSheet = () => {
  const axiosInstance = useAxiosAuth();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/api/my-notifications");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data: fetchedNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  useEffect(() => {
    if (fetchedNotifications) {
      setNotifications(fetchedNotifications);
    }
  }, [fetchedNotifications]);

  useEffect(() => {
    if (!session?.user?.companyId) return;

    const channel = pusherClient.subscribe(`company-${session.user.companyId}`);

    channel.bind("new-notification", (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      pusherClient.unsubscribe(`company-${session.user.companyId}`);
    };
  }, [session?.user?.companyId]);

  const markAsRead = async (id: number) => {
    try {
      await axiosInstance.put(`/api/mark-as-read/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <GenericSheet
      open={open}
      onOpenChange={setOpen}
      title="Notifications"
      trigger={
        <div className="relative cursor-pointer">
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </div>
          )}
          <FaRegBell size={23} />
        </div>
      }
      footer={
        notifications.length > 0 && (
          <div className="w-full flex justify-end">
            <Button
              variant="outline"
              onClick={async () => {
                await Promise.all(notifications.map((n) => markAsRead(n.id)));
              }}
            >
              Mark all as read
            </Button>
          </div>
        )
      }
    >
      <ScrollArea className="h-[75vh] mt-4 pr-2 space-y-4">
        {notifications.length === 0 ? (
          <p className="text-muted-foreground text-sm">No new notifications</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-md border cursor-pointer transition my-4 flex justify-between items-center ${
                !notif.read
                  ? "bg-accent border-primary/40 hover:bg-accent/80"
                  : "hover:bg-muted"
              }`}
              onClick={() => {
                markAsRead(notif.id);
                setTimeout(() => {
                  window.location.href = notif.url;
                }, 100);
              }}
            >
              <p
                className={`text-sm font-medium ${
                  !notif.read
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {notif.message}
              </p>

              {notif.read && (
                <FaCheckCircle className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
              )}
            </div>
          ))
        )}
      </ScrollArea>
    </GenericSheet>
  );
};

export default NotificationSheet;
