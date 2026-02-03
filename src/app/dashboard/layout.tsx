"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import Sidebar from "@/features/admin-layout/ui/Sidebar";
import Navbar from "@/features/admin-layout/ui/Navbar";
import ScrollToTop from "@/features/admin-layout/ui/scroll-to-top";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { TourProvider } from "@/features/tour/TourProvider";
import { ZendeskWidget } from "@/shared/widgets/zendesk";

const ADMIN_ROLES = ["admin", "super_admin", "hr_manager", "manager"] as const;

function normalizeRole(value: string) {
  return value.trim().toLowerCase();
}

function isAdminRole(role: unknown): boolean {
  const roles: string[] = Array.isArray(role)
    ? role.filter((r): r is string => typeof r === "string")
    : typeof role === "string"
      ? [role]
      : [];

  const allowed = new Set<string>(ADMIN_ROLES);
  return roles.some((r) => allowed.has(normalizeRole(r)));
}

export default function AdminChromeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fallbackEmployeeRoute = useMemo(() => {
    const user: any = session?.user;
    const employmentStatus = user?.employmentStatus;
    return employmentStatus === "onboarding" ? "/onboarding" : "/ess";
  }, [session?.user]);

  const allowed = useMemo(() => {
    const user: any = session?.user;
    return isAdminRole(user?.role);
  }, [session?.user]);

  useEffect(() => {
    // This guard is mostly redundant because server layout blocks already.
    if (status === "loading") return;

    if (status === "unauthenticated") {
      if (window.location.pathname !== "/login") router.replace("/login");
      return;
    }

    if (!allowed) {
      if (window.location.pathname !== fallbackEmployeeRoute) {
        router.replace(fallbackEmployeeRoute);
      }
    }
  }, [status, allowed, router, fallbackEmployeeRoute]);

  // While loading / redirecting, render nothing
  if (status === "loading") return null;
  if (status === "unauthenticated") return null;
  if (!allowed) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div
        className={`bg-white min-h-screen transition-all ease-in-out duration-500 ${
          sidebarCollapsed
            ? "md:ml-16 md:w-[calc(100%-4rem)]"
            : "md:ml-[16%] md:w-[84%]"
        }`}
      >
        <main className="py-4">
          <Navbar sidebarCollapsed={sidebarCollapsed} />
          <ScrollToTop />

          <ZendeskWidget />

          <TourProvider>
            <div className="mt-[9vh]">{children}</div>
          </TourProvider>
        </main>
      </div>
    </div>
  );
}
