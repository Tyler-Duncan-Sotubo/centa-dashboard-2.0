"use client";

import PushNotification from "../../admin-layout/ui/PushNotification";
import { signOut } from "next-auth/react";
import { MdLogout } from "react-icons/md";
import { WorkspaceSwitcher } from "@/shared/ui/work-space-switcher";
import { Input } from "@/shared/ui/input";
import { Search } from "lucide-react";

const EssNavbar = ({ sidebarCollapsed }: { sidebarCollapsed: boolean }) => {
  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("workspace");
      localStorage.removeItem("last_mgr");
      localStorage.removeItem("last_emp");
    }
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div
      className={`fixed top-0 h-[10vh] bg-white z-50 px-4 transition-all duration-300 ease-in-out hidden sm:block ${
        sidebarCollapsed
          ? "md:left-16 md:w-[calc(100%-4rem)]"
          : "md:left-[16%] md:w-[84%]"
      }`}
    >
      <div className="flex justify-between items-center h-full w-full md:px-6">
        <Input
          type="search"
          placeholder="Search..."
          className="w-1/2 min-w-150 bg-sidebar text-textPrimary placeholder:text-textSecondary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-opacity-50 border-none"
          leftIcon={<Search size={20} className="text-textSecondary" />}
        />
        {/* Left Icons */}
        <div className="flex items-center h-full space-x-4 w-1/3 justify-end">
          <WorkspaceSwitcher />
          <PushNotification />
          <button
            onClick={() => handleLogout()}
            className="flex items-center gap-2 py-2 rounded text-monzo-error"
          >
            <MdLogout size={25} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EssNavbar;
