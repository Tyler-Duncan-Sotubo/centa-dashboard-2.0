"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { essMain } from "@/data/sidebar.data";
import { Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { MdLogout } from "react-icons/md";

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <div className="md:hidden p-2">
      <Sheet>
        <SheetTrigger asChild>
          <button
            aria-label="Open navigation menu"
            className="p-2 focus:outline-none"
          >
            <Menu className="h-8 w-8 text-monzo-brand" />
          </button>
        </SheetTrigger>

        <SheetContent side="right" className="w-64 p-0 bg-white">
          <nav className="flex flex-col gap-1 px-4 py-4 mt-10">
            {essMain.map((item) => {
              const isActive = pathname === item.link;
              const Icon = item.icon;
              return (
                <SheetClose asChild key={item.title}>
                  <Link
                    href={item.link ?? "#"}
                    className={`flex items-center gap-3 rounded px-3 py-2 text-monzo-background font-medium transition-colors ${
                      isActive
                        ? "bg-monzo-brand/20 text-monzo-background"
                        : "text-monzo-background hover:bg-monzo-brand/10"
                    }`}
                  >
                    {Icon}
                    <span>{item.title}</span>
                  </Link>
                </SheetClose>
              );
            })}
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 rounded px-3 py-2 text-base font-medium text-monzo-error hover:bg-monzo-brand/10"
            >
              <MdLogout size={20} />
              <span className="">Logout</span>
            </button>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;
