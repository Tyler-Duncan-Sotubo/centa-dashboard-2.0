/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { Badge } from "@/shared/ui/badge";

// pick icons you want for “app-style” tabs
import { MdAccessAlarms, MdDashboard } from "react-icons/md";
import { FaClipboardUser, FaGift, FaTags } from "react-icons/fa6";
import { PiSneakerMoveFill } from "react-icons/pi";
import { essMain } from "../config/mobile-sidebar.data";
import { MobileMoreNav } from "./mobile-more-nav";

type BottomTab = {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number | null;
  isActive?: (pathname: string) => boolean;
};

const isLinkOrDescendant = (pathname: string, link?: string | null) =>
  !!link && (pathname === link || pathname.startsWith(link + "/"));

// flatten menu to find a link by title (optional helper)
function findLinkByTitle(title: string): string | null {
  for (const item of essMain as any[]) {
    if (item?.link && item?.title === title) return item.link;
    for (const sub of item?.subItems ?? []) {
      if (sub?.link && sub?.title === title) return sub.link;
    }
  }
  return null;
}

export function EssMobileAppNav() {
  const pathname = usePathname();

  // Choose 4–5 “primary” tabs for ESS
  const tabs: BottomTab[] = [
    {
      key: "home",
      label: "Home",
      href: findLinkByTitle("Home") ?? "/ess",
      icon: <MdDashboard className="h-5 w-5" />,
      isActive: (p) => isLinkOrDescendant(p, "/ess") && p === "/ess",
    },
    {
      key: "profile",
      label: "Profile",
      href: findLinkByTitle("Profile") ?? "/ess/profile",
      icon: <FaClipboardUser className="h-5 w-5" />,
      isActive: (p) => isLinkOrDescendant(p, "/ess/profile"),
    },
    {
      key: "timesheet",
      label: "Timesheet",
      href: findLinkByTitle("Timesheet") ?? "/ess/attendance",
      icon: <MdAccessAlarms className="h-5 w-5" />,
      isActive: (p) => isLinkOrDescendant(p, "/ess/attendance"),
    },
    {
      key: "leave",
      label: "Leave",
      href: findLinkByTitle("Leave") ?? "/ess/leave",
      icon: <PiSneakerMoveFill className="h-5 w-5" />,
      isActive: (p) => isLinkOrDescendant(p, "/ess/leave"),
    },
  ];

  return (
    <>
      {/* Bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-white py-1">
        <div className="grid grid-cols-5 items-center">
          {tabs.map((t) => {
            const active = t.isActive
              ? t.isActive(pathname)
              : isLinkOrDescendant(pathname, t.href);

            return (
              <Link
                key={t.key}
                href={t.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2 text-[10px]",
                  active
                    ? "text-primary font-extrabold"
                    : "text-muted-foreground font-semibold",
                )}
              >
                <div className="relative">
                  {t.icon}
                  {t.badge ? (
                    <span className="absolute -top-2 -right-3">
                      <Badge className="h-5 px-2 text-[10px]">{t.badge}</Badge>
                    </span>
                  ) : null}
                </div>
                <span className="leading-none">{t.label}</span>
              </Link>
            );
          })}

          {/* More (drawer) */}
          <MobileMoreNav menu={essMain as any[]} />
        </div>
      </nav>

      {/* Spacer so content doesn’t hide behind bottom bar */}
      <div className="md:hidden h-16" />
    </>
  );
}
