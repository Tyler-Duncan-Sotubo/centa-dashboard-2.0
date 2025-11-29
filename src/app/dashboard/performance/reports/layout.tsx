"use client";

import BackButton from "@/components/ui/back-button";
import React from "react";
import { usePathname } from "next/navigation";

import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <div className="px-5">
        {usePathname() !== "/dashboard/performance/reports" && (
          <BackButton
            href="/dashboard/performance/reports"
            className="mb-4"
            label="Back to Performance"
          />
        )}
      </div>
      {children}
    </div>
  );
};

export default Layout;
