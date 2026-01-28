/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { filterMenu, essMain, MenuItem } from "../config/mobile-sidebar.data";
import ApplicationLogo from "../../../shared/ui/applicationLogo";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shared/ui/tooltip";
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

export default function EssSidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userPermissions = session?.permissions ?? [];

  const filteredMenu = filterMenu(essMain, userPermissions);

  // Flatten all sub-items with a reference to their parent menu
  const flatSubs = filteredMenu.flatMap(
    (menu) => menu.subItems?.map((sub) => ({ parent: menu, sub })) ?? [],
  );

  // Find all sub-items whose link is a prefix of the current path
  const matches = flatSubs.filter(
    ({ sub }) =>
      sub.link != null &&
      (pathname === sub.link || pathname.startsWith(sub.link + "/")),
  );

  // Pick the most specific match (longest link)
  const bestMatch = matches.sort(
    (a, b) => (b.sub.link?.length ?? 0) - (a.sub.link?.length ?? 0),
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
          <div className="flex px-3 h-14 my-3">
            <ApplicationLogo
              className={
                isCollapsed ? "h-10 w-8 flex justify-center" : "h-14 w-24"
              }
              src={
                isCollapsed
                  ? "https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/55df5e55-f3e0-44c6-a39f-390ef8466d56/9a3be800-ca54-4bf9-a3ed-72b68baf52f7/1768989575869-Centa%20Logo%20DesignArtboard%201%20copy%209@3x.png"
                  : "https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/55df5e55-f3e0-44c6-a39f-390ef8466d56/9a3be800-ca54-4bf9-a3ed-72b68baf52f7/1768990158119-Centa%20Logo%20DesignArtboard%201%20copy%208@3x.png"
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
                  href="/ess"
                  className="flex items-center gap-3 px-2 py-2 rounded hover:bg-monzo-brand"
                >
                  <FiChevronLeft size={24} />
                  {!isCollapsed && (
                    <span className="text-md font-semibold">Home</span>
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
                        <Link
                          href={sub.link!}
                          className={`flex items-center gap-2 px-3 py-2 text-md rounded transition-colors ${
                            sub.link === activeSubLink
                              ? "text-monzo-monzoGreen font-medium"
                              : "hover:bg-monzo-brand"
                          }`}
                        >
                          {sub.icon}
                          {!isCollapsed && <span>{sub.title}</span>}
                        </Link>
                      </li>
                    ),
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
