/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { filterMenu, main, MenuItem } from "@/data/sidebar.data";
import ApplicationLogo from "../ui/applicationLogo";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  TbLayoutSidebarRightCollapseFilled,
  TbLayoutSidebarLeftCollapseFilled,
} from "react-icons/tb";
import { useSession } from "next-auth/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userPermissions = session?.permissions ?? [];

  type Checklist = {
    staff: boolean;
    payroll: boolean;
    performance: boolean;
    hiring: boolean;
    attendance: boolean;
    leave: boolean;
  };
  const checklist = (session?.checklist ?? {}) as Partial<Checklist>;

  const titleToChecklistKey: Record<string, keyof Checklist> = {
    Hiring: "hiring",
    Staff: "staff",
    Performance: "performance",
    Attendance: "attendance",
    "Time Off": "leave",
    Payroll: "payroll",
  };

  const shouldShowChecklist = (menuTitle: string, checklistLink?: string) => {
    const key = titleToChecklistKey[menuTitle];
    if (!key) return true; // sections without a checklist rule
    const isComplete = checklist[key] === true;

    // Keep visible if it's the active route (avoid disappearing while on page)
    const isActiveRoute =
      checklistLink &&
      (pathname === checklistLink || pathname.startsWith(checklistLink + "/"));

    return isActiveRoute || !isComplete; // show if not complete, or if active
  };

  // 2) Apply the checklist rule after permission filtering
  const byPerm = filterMenu(main, userPermissions);

  const filteredMenu = byPerm.map((menu) => {
    if (!("subItems" in menu) || !menu.subItems) return menu;

    const prunedSubs = menu.subItems.filter((sub) => {
      if (sub.title !== "Setup Checklist") return true;
      return shouldShowChecklist(menu.title, sub.link);
    });

    return { ...menu, subItems: prunedSubs };
  });

  // Flatten all sub-items with a reference to their parent menu
  const flatSubs = filteredMenu.flatMap(
    (menu) => menu.subItems?.map((sub) => ({ parent: menu, sub })) ?? []
  );

  // Find all sub-items whose link is a prefix of the current path
  const matches = flatSubs.filter(
    ({ sub }) =>
      sub.link != null &&
      (pathname === sub.link || pathname.startsWith(sub.link + "/"))
  );

  // Pick the most specific match (longest link)
  const bestMatch = matches.sort(
    (a, b) => (b.sub.link?.length ?? 0) - (a.sub.link?.length ?? 0)
  )[0];

  const activeMenu: MenuItem | null = bestMatch?.parent ?? null;
  const activeSubLink: string = bestMatch?.sub.link ?? "";

  return (
    <TooltipProvider>
      <motion.aside
        animate={{ width: isCollapsed ? "4rem" : "16%" }}
        transition={{ duration: 0.2 }}
        className="md:fixed hidden left-0 top-0 h-screen bg-monzo-background text-monzo-textPrimary border-r p-2 md:flex flex-col justify-between overflow-y-auto"
      >
        <div>
          {/* Logo */}
          <div className={`my-5 ${isCollapsed ? "px-1" : "px-3"}`}>
            <ApplicationLogo
              className={
                isCollapsed ? "h-10 w-8 flex justify-center" : "h-14 w-24"
              }
              src={
                isCollapsed
                  ? "https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757584746/logo-icon_ig26ee.png"
                  : "https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757584747/logo-white_zveolj.png"
              }
              alt="Company Logo"
              link="/dashboard"
            />
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {activeMenu === null ? (
              // Top-level menu
              filteredMenu.map((item) => {
                const hasSub = Boolean(item.subItems?.length);
                const isActive =
                  pathname === item.link ||
                  item.subItems?.some((sub) => sub.link === activeSubLink);

                return (
                  <div key={item.title}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.link || "#"}
                          className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                            isActive
                              ? "text-monzo-monzoGreen font-semibold"
                              : "hover:bg-monzo-brand"
                          }`}
                        >
                          {item.icon}
                          {!isCollapsed && (
                            <span className="flex items-center justify-between w-full text-md">
                              {item.title}
                              {hasSub && <FiChevronRight size={16} />}
                            </span>
                          )}
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                );
              })
            ) : (
              // Sub-menu for the active top-level item
              <div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-2 py-2 rounded hover:bg-monzo-brand"
                >
                  <FiChevronLeft size={24} />
                  {!isCollapsed && (
                    <span className="text-md font-semibold">Dashboard</span>
                  )}
                </Link>

                {!isCollapsed && (
                  <div className="px-3 mt-4 mb-2 text-xs uppercase text-textSecondary font-bold">
                    {activeMenu.title}
                  </div>
                )}

                <ul>
                  {activeMenu.subItems!.map((sub) =>
                    sub.name ? (
                      !isCollapsed && (
                        <li
                          key={sub.name}
                          className="text-xs uppercase text-textSecondary px-3 py-2 my-2"
                        >
                          {sub.name}
                        </li>
                      )
                    ) : (
                      <li key={sub.link}>
                        {/* ↓↓↓ Added tooltip for submenu items ↓↓↓ */}
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Link
                              href={sub.link!}
                              className={`flex items-center gap-2 px-3 py-2 text-md rounded transition-colors ${
                                sub.title === "Setup Checklist"
                                  ? // Always secondary, ignore hover/active color swaps
                                    "text-monzo-secondary font-medium"
                                  : sub.link === activeSubLink
                                  ? "text-monzo-monzoGreen font-medium"
                                  : "hover:bg-monzo-brand"
                              }${isCollapsed ? "mt-3" : ""}
`}
                            >
                              <p className={`${isCollapsed ? "mt-2" : ""}`}>
                                {sub.icon}
                              </p>
                              {!isCollapsed && <span>{sub.title}</span>}
                            </Link>
                          </TooltipTrigger>

                          {isCollapsed && (
                            <TooltipContent side="right">
                              {sub.title}
                            </TooltipContent>
                          )}
                        </Tooltip>

                        {/* ↑↑↑ Added tooltip for submenu items ↑↑↑ */}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </nav>
        </div>

        {/* Collapse Toggle */}
        <div className="flex justify-end px-2 pb-2">
          <button
            onClick={onToggle}
            className="p-2 rounded hover:bg-monzo-brand"
          >
            {isCollapsed ? (
              <TbLayoutSidebarRightCollapseFilled size={20} />
            ) : (
              <TbLayoutSidebarLeftCollapseFilled size={25} />
            )}
          </button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
