"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";

import ApplicationLogo from "../../../shared/ui/applicationLogo";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet";
import { WorkspaceSwitcher } from "../../../shared/ui/work-space-switcher";
import { main } from "@/features/admin-layout/config/sidebar.data";

type MobileNavProps = {
  onLogout?: () => Promise<void> | void; // optional if you want to pass your handleLogout
};

const MobileNav = ({ onLogout }: MobileNavProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<number, boolean>>({});

  const defaultLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("workspace");
      localStorage.removeItem("last_mgr");
      localStorage.removeItem("last_emp");
    }
    await signOut({ callbackUrl: "/login" });
  };

  const handleLogout = async () => {
    if (onLogout) await onLogout();
    else await defaultLogout();
  };

  return (
    <div className="md:hidden flex justify-between items-center w-full ">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Menu size={28} className="text-brand cursor-pointer" />
        </SheetTrigger>

        <SheetContent className="w-full bg-white overflow-auto">
          <ApplicationLogo
            className="h-20 w-32"
            src="https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/55df5e55-f3e0-44c6-a39f-390ef8466d56/9a3be800-ca54-4bf9-a3ed-72b68baf52f7/1768990436384-logo-CqG_6WrI.svg"
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

                const toggleOrNavigate = () => {
                  if (item.subItems) {
                    setOpenSubmenus((prev) => ({
                      ...prev,
                      [index]: !prev[index],
                    }));
                  } else {
                    setOpenSubmenus({});
                    setIsOpen(false);
                  }
                };

                return (
                  <li key={index} className="mb-3">
                    <Link
                      href={item.link ?? "#"}
                      onClick={toggleOrNavigate}
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
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

      <WorkspaceSwitcher />
    </div>
  );
};

export default MobileNav;
