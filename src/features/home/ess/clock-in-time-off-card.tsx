/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Link from "next/link";

import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useToast } from "@/shared/hooks/use-toast";

import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Separator } from "@/shared/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";

import { IUser } from "@/types/employees.type";
import { Pencil, User } from "lucide-react";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { useAuth } from "@/shared/context/AuthContext";

/* LocalStorage Helpers */
const LS_KEY_PREFIX = "clock-in-timer";
type StoredState = { clockIn?: number; clockOut?: number; running: boolean };
const keyForUser = (userId: string) => `${LS_KEY_PREFIX}:${userId}`;

const saveState = (
  userId: string,
  ci: Date | null,
  co: Date | null,
  running: boolean,
) =>
  localStorage.setItem(
    keyForUser(userId),
    JSON.stringify({
      clockIn: ci?.getTime(),
      clockOut: co?.getTime(),
      running,
    } as StoredState),
  );

const loadState = (userId: string): StoredState => {
  try {
    const raw = localStorage.getItem(keyForUser(userId));
    return raw ? (JSON.parse(raw) as StoredState) : { running: false };
  } catch {
    return { running: false };
  }
};

/* Geolocation helper */
const getCurrentPosition = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by this browser."));
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 8000,
    });
  });

export default function ClockInTimeOffCard({
  employee,
  requestTimeOffHref = "/ess/leave",
}: {
  employee: IUser | null;
  requestTimeOffHref?: string;
}) {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const { refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(
    employee?.avatar || null,
  );

  const updateProfile = useUpdateMutation({
    endpoint: "api/auth/profile",
    successMessage: "Profile Updated",
    refetchKey: "user profile",
    onSuccess: () => refreshUser(),
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatarSrc(base64);

      await updateProfile({
        avatar: base64,
        email: employee?.email || "",
        first_name: employee?.first_name || "",
        last_name: employee?.last_name || "",
      });
    };
    reader.readAsDataURL(file);
  };

  const userId = (session?.user as any)?.id as string | undefined;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [clockOutTime, setClockOutTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // reset on user switch
  useEffect(() => {
    if (!userId) return;
    setClockInTime(null);
    setClockOutTime(null);
    setIsRunning(false);
    setCurrentTime(new Date());
    setHydrated(false);
  }, [userId]);

  // sync status
  useEffect(() => {
    if (status !== "authenticated") return;
    if (!userId) return;

    let cancelled = false;

    const syncStatus = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/clock-in-out/status/${userId}`,
        );

        if (cancelled) return;

        if (res.data?.status === "success") {
          const { checkInTime, checkOutTime } = res.data.data;

          const ci = checkInTime ? new Date(checkInTime) : null;
          const co = checkOutTime ? new Date(checkOutTime) : null;

          setClockInTime(ci);
          setClockOutTime(co);
          setIsRunning(Boolean(ci && !co));
        } else {
          const { clockIn, clockOut, running } = loadState(userId);
          setClockInTime(clockIn ? new Date(clockIn) : null);
          setClockOutTime(clockOut ? new Date(clockOut) : null);
          setIsRunning(running);
        }
      } catch {
        if (cancelled) return;
        const { clockIn, clockOut, running } = loadState(userId);
        setClockInTime(clockIn ? new Date(clockIn) : null);
        setClockOutTime(clockOut ? new Date(clockOut) : null);
        setIsRunning(running);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    };

    syncStatus();

    return () => {
      cancelled = true;
    };
  }, [status, userId, axiosInstance]);

  // live timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (hydrated && isRunning && clockInTime && !clockOutTime) {
      interval = setInterval(() => setCurrentTime(new Date()), 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hydrated, isRunning, clockInTime, clockOutTime]);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    if (!userId) return;
    saveState(userId, clockInTime, clockOutTime, isRunning);
  }, [clockInTime, clockOutTime, isRunning, hydrated, userId]);

  const fmtStatus = () => {
    if (clockOutTime) return "You clocked out";
    if (isRunning) return "You are clocked in";
    return "Clock In";
  };

  const fmt = (d: Date) => format(d, "EEE, HH:mm:ss");

  const fmtMainTime = () => {
    if (clockOutTime) return fmt(clockOutTime);
    return fmt(currentTime);
  };

  const fmtDate = (date?: Date) => {
    return format(date ?? new Date(), "EEEE, MMMM d, yyyy");
  };

  const handleClockIn = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const pos = await getCurrentPosition();
      const { latitude, longitude } = pos.coords;

      const res = await axiosInstance.post("/api/clock-in-out/clock-in", {
        latitude: String(latitude),
        longitude: String(longitude),
      });

      if (res.data?.status === "success") {
        const now = new Date();
        setClockInTime(now);
        setClockOutTime(null);
        setIsRunning(true);

        toast({
          title: "Clocked in",
          description: `at ${format(now, "HH:mm:ss")}`,
          variant: "success",
        });
      }
    } catch (err: any) {
      const msg =
        err?.message === "Geolocation is not supported by this browser."
          ? err.message
          : err?.code === 1 || err?.message?.includes?.("denied")
            ? "Location permission denied. Enable it to clock-in."
            : err?.response?.data?.error?.message || "Try again later.";

      toast({
        title: "Clock in failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const pos = await getCurrentPosition();
      const { latitude, longitude } = pos.coords;

      const res = await axiosInstance.post("/api/clock-in-out/clock-out", {
        latitude: String(latitude),
        longitude: String(longitude),
      });

      if (res.data?.status === "success") {
        const now = new Date();
        setClockOutTime(now);
        setIsRunning(false);

        toast({
          title: "Clocked out",
          description: `at ${format(now, "HH:mm:ss")}`,
          variant: "default",
        });
      }
    } catch (err: any) {
      const msg =
        err?.code === 1
          ? "Location permission denied. Enable it to clock-out."
          : err?.response?.data?.error?.message || "Try again later.";

      toast({
        title: "Clock out failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") return null;
  if (!hydrated) return null;

  return (
    <Card className="relative w-full pt-12 pb-5 px-5">
      {/* Avatar (sticking out) */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-background shadow-sm">
            <AvatarImage
              src={avatarSrc ?? employee?.avatar ?? undefined}
              alt="Avatar"
            />
            <AvatarFallback>
              <User className="w-8 h-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            className="hidden"
          />

          <Button
            size="icon"
            variant="secondary"
            className="absolute top-3 -right-1 w-6 h-6 rounded-full shadow-xs bg-white"
            title="Edit Avatar"
            onClick={() => fileInputRef.current?.click()}
          >
            <Pencil className="w-3.5 h-3.5 text-monzo-brand" />
          </Button>
        </div>
      </div>

      {/* Date under avatar */}
      <div className="text-center mt-3 mb-8">
        <div className="text-xl text-monzo-brand font-bold">{fmtDate()}</div>
      </div>

      {/* ✅ GRID ensures left / divider / right are always aligned */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] md:items-center gap-4">
        {/* LEFT: My Clock */}
        <div className="flex h-full min-w-0 flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground">
              {fmtStatus()}
            </div>
            <div className="md:text-2xl text-xl font-bold text-foreground wrap-break-word">
              {fmtMainTime()}
            </div>
          </div>

          <div className="w-full sm:w-auto sm:self-center">
            {isRunning ? (
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full sm:w-auto bg-monzo-error"
                    disabled={isLoading}
                    isLoading={isLoading}
                    type="button"
                  >
                    Clock Out
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clock out now?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will end your work session. Only continue if you’re
                      sure.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      disabled={isLoading}
                      onClick={async () => {
                        setConfirmOpen(false);
                        await handleClockOut();
                      }}
                      className="bg-monzo-error hover:bg-monzo-error/90"
                    >
                      Yes, clock out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                className="w-full sm:w-auto"
                onClick={handleClockIn}
                disabled={isLoading}
                isLoading={isLoading}
              >
                Clock In
              </Button>
            )}
          </div>
        </div>

        {/* Divider: vertical on md+, horizontal on mobile */}
        <div className="hidden md:flex h-full items-stretch justify-center">
          <Separator orientation="vertical" className="h-full" />
        </div>
        <div className="md:hidden">
          <Separator orientation="horizontal" />
        </div>

        {/* RIGHT: Time Off */}
        <div className="flex h-full min-w-0 flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground">Leave</div>
            <p className="text-xl font-bold text-foreground">Time Off</p>
          </div>

          <div className="w-full md:w-auto md:self-center">
            <Link href={requestTimeOffHref} className="block">
              <Button
                variant="outline"
                className="text-monzo-brand w-full md:w-44"
              >
                Request
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
