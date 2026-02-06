"use client";

import { usePathname } from "next/navigation";
import ProfileSettings from "./ProfileSettings";
import NotificationSheet from "./NotificationSheet";
import { WorkspaceSwitcher } from "../../../shared/ui/work-space-switcher";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { FaCog } from "react-icons/fa";
import { PiMegaphoneFill } from "react-icons/pi";
import { MdLogout } from "react-icons/md";

import MobileNav from "./MobileNav";

const Navbar = ({ sidebarCollapsed }: { sidebarCollapsed: boolean }) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const adminRoles = ["admin", "super_admin", "hr_manager"];
  const nonAdmin = !adminRoles.includes(session?.user.role || "");

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("workspace");
      localStorage.removeItem("last_mgr");
      localStorage.removeItem("last_emp");
    }
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div
      className={`fixed top-0 h-[10vh] w-full bg-white z-50 md:px-4 transition-all duration-300 ease-in-out ${
        sidebarCollapsed
          ? "md:left-16 md:w-[calc(100%-4rem)]"
          : "md:left-[16%] md:w-[84%]"
      }`}
    >
      <div className="flex items-center justify-end h-full px-4 md:px-4 w-full">
        {/* Mobile Menu */}
        <MobileNav onLogout={handleLogout} />

        {/* Right-side Icons */}
        <div className="hidden md:flex items-center space-x-6">
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
              onClick={handleLogout}
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
