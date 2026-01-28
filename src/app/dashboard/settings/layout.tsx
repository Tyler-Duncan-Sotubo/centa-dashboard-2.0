"use client";

import { Button } from "@/shared/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isSettingsPage = pathname === "/dashboard/settings";
  return (
    <div>
      <header className="inline-block">
        {!isSettingsPage && (
          <Link href="/dashboard/settings">
            <Button variant={"link"} className="text-xl flex items-center">
              <ChevronLeft /> Settings
            </Button>
          </Link>
        )}
      </header>
      <main className="flex-1 md:px-6 px-3 py-3">{children}</main>
    </div>
  );
};

export default SettingsLayout;
