"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import ProfileSettings from "./ProfileSettings";
import ApplicationLogo from "../../../shared/ui/applicationLogo";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet";
import { ChevronDown, LogOut, Menu, Search } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { main } from "@/features/admin-layout/config/sidebar.data";
import { signOut, useSession } from "next-auth/react";
import { FaCog } from "react-icons/fa";
import { PiMegaphoneFill } from "react-icons/pi";
import NotificationSheet from "./NotificationSheet";
import { WorkspaceSwitcher } from "../../../shared/ui/work-space-switcher";
import { MdLogout } from "react-icons/md";
import { Button } from "../../../shared/ui/button";

const Navbar = ({ sidebarCollapsed }: { sidebarCollapsed: boolean }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: number]: boolean }>(
    {},
  );
  const { data: session } = useSession();
  const adminRoles = ["admin", "super_admin", "hr_manager"];
  const nonAdmin = !adminRoles.includes(session?.user.role || "");

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("workspace");
      localStorage.removeItem("last_mgr");
      localStorage.removeItem("last_emp");
    }
    await signOut({ callbackUrl: "/auth/login" });
  };

  const raw = session?.permissions || [];
  let perms: string[] = [];

  if (Array.isArray(raw)) {
    perms = raw as string[];
  } else if (typeof raw === "string") {
    try {
      perms = JSON.parse(raw);
    } catch {
      perms = [];
    }
  }

  const tag = perms.find((p) => p.startsWith("trial.days_left:"));
  const trialDaysLeft = tag ? Number(tag.split(":")[1]) : null;

  return (
    <div
      className={`fixed top-0 h-[10vh] bg-white z-50 px-4 transition-all duration-300 ease-in-out ${
        sidebarCollapsed
          ? "md:left-16 md:w-[calc(100%-4rem)]"
          : "md:left-[16%] md:w-[84%]"
      }`}
    >
      <div className="flex items-center justify-end h-full px-4 md:px-4">
        {/* Mobile Menu */}
        <div className="md:hidden flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Menu size={28} className="text-brand cursor-pointer" />
            </SheetTrigger>
            <SheetContent className="w-full bg-white">
              <ApplicationLogo
                className="h-20 w-32"
                src="/logo.png"
                alt="Logo"
                link="/dashboard"
                close={() => setIsOpen(false)}
              />

              <nav className="mt-6 space-y-6">
                <ul>
                  {main.map((item, index) => {
                    const isActive =
                      item.link === "/dashboard"
                        ? pathname === "/dashboard"
                        : item.link && pathname.startsWith(item.link);

                    return (
                      <li key={index} className="mb-3">
                        <Link
                          href={item.link ?? "#"}
                          onClick={() =>
                            item.subItems
                              ? setOpenSubmenus((prev) => ({
                                  ...prev,
                                  [index]: !prev[index],
                                }))
                              : (() => {
                                  setOpenSubmenus({});
                                  setIsOpen(false);
                                })()
                          }
                          className={`flex w-full items-center justify-between py-3 px-4 transition-colors duration-300 ${
                            isActive
                              ? "font-bold text-textPrimary"
                              : "hover:bg-black/5"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span
                              className={`text-md font-bold ${
                                isActive ? "text-textPrimary" : ""
                              }`}
                            >
                              {item.title}
                            </span>
                          </div>
                          {item.subItems && (
                            <ChevronDown
                              size={20}
                              className={`transform transition-transform ${
                                openSubmenus[index] ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </Link>

                        {item.subItems && openSubmenus[index] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-8 space-y-2 overflow-hidden"
                            onClick={() => setIsOpen(false)}
                          >
                            {item.subItems.map((sub) => (
                              <Link
                                key={sub.link}
                                href={sub.link ?? "#"}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-2 py-2 px-6 text-md transition-colors duration-300 ${
                                  pathname === sub.link
                                    ? "bg-white font-bold text-textPrimary"
                                    : "hover:bg-black/5"
                                }`}
                              >
                                {sub.title}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </li>
                    );
                  })}

                  <button
                    className="mt-6 flex w-full items-center gap-4 px-4 py-3 font-semibold text-textPrimary hover:text-red-500"
                    onClick={() => handleLogout()}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Right-side Icons */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Trial Ends */}
          <div className="flex items-center">
            {trialDaysLeft != null && (
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  trialDaysLeft < 0 ? "bg-red-100 text-red-800" : ""
                }`}
              >
                {trialDaysLeft > 0
                  ? `Your trial ends in ${trialDaysLeft} ${
                      trialDaysLeft === 1 ? "day" : "days"
                    }`
                  : trialDaysLeft === 0
                    ? "Your trial ends today!"
                    : "Your trial has ended. Please upgrade!"}
              </div>
            )}
            {trialDaysLeft != null && (
              <Button className="h-9 text-sm">Upgrade</Button>
            )}
          </div>
          <WorkspaceSwitcher />
          <NotificationSheet />
          <Link
            href="/dashboard/announcement"
            className="flex items-center gap-2 text-textPrimary hover:text-brand"
          >
            <PiMegaphoneFill
              size={25}
              className={`hover:text-brand ${
                pathname === "/dashboard/announcement"
                  ? "text-brand"
                  : "text-textPrimary"
              }`}
            />
          </Link>

          {!nonAdmin && (
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 text-textPrimary hover:text-brand"
            >
              <FaCog
                size={25}
                className={`hover:text-brand ${
                  pathname === "/dashboard/settings"
                    ? "text-brand"
                    : "text-textPrimary"
                }`}
              />
            </Link>
          )}

          {nonAdmin ? (
            <button
              onClick={() => handleLogout()}
              className="flex items-center gap-2 py-2 rounded text-monzo-error"
            >
              <MdLogout size={25} />
            </button>
          ) : (
            <ProfileSettings />
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
