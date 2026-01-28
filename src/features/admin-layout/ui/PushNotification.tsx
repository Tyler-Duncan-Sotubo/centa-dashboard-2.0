import React, { useEffect, useState } from "react";
import { FaRegBell } from "react-icons/fa";
import { isAxiosError } from "@/lib/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import pusherClient from "@/lib/pusher";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

// Import relevant icons
const PushNotification = () => {
  interface Notification {
    id: number;
    message: string;
    url: string;
    read: boolean;
  }

  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]); // Store notification messages

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

  const { data: Notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: Boolean(session?.backendTokens?.accessToken),
    refetchOnMount: true,
  });

  const markAsRead = async (id: number) => {
    try {
      await axiosInstance.put(`/api/mark-as-read/${id}`);

      // Remove the read notification from state
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));

      // Optionally, refetch notifications from the server
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const channel = pusherClient.subscribe(
      `company-${session?.user?.companyId}`,
    );

    channel.bind("new-notification", (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      pusherClient.unsubscribe(`company-${session?.user?.companyId}`);
    };
  }, [session?.user, Notifications]);

  useEffect(() => {
    if (Notifications) {
      setNotifications(Notifications);
    }
  }, [session?.user, Notifications]);

  const unreadNotifications = notifications.filter((notif) => !notif.read);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative focus:outline-hidden">
        {unreadNotifications.length > 0 && (
          <div className="absolute -top-2 -right-1 flex items-center justify-center w-5 h-5 bg-error text-white text-xs font-bold rounded-full">
            {unreadNotifications.length}
          </div>
        )}
        <div className="cursor-pointer">
          <FaRegBell size={23} className="flex items-center" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-10 capitalize w-68 font-bold space-y-2 py-2">
        {notifications.length === 0 ? (
          <div className="p-2 text-gray-500">No new notifications</div>
        ) : (
          <>
            {notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className="px-5 py-4 flex items-center gap-4 border-b border-gray-200 text-sm last:border-0"
                asChild
              >
                <Link
                  href={notif.url}
                  onClick={(e) => {
                    e.preventDefault(); // Prevents instant navigation
                    markAsRead(notif.id);
                    setTimeout(() => {
                      window.location.href = notif.url; // Navigate after update
                    }, 100); // Small delay for smoother UI experience
                  }}
                >
                  <div className="flex items-center gap-4">
                    <FaRegBell className="w-5 h-5 text-gray-500" />
                    {notif.message}
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PushNotification;
