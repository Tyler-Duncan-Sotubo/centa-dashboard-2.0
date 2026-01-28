"use client";

import { useState } from "react";
import Sidebar from "@/features/admin-layout/ui/Sidebar";
import Navbar from "@/features/admin-layout/ui/Navbar";
import ScrollToTop from "@/features/admin-layout/ui/scroll-to-top";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { TourProvider } from "@/features/tour/TourProvider";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content */}
      <div
        className={`bg-white min-h-screen transition-all ease-in-out duration-500 ${
          sidebarCollapsed
            ? "md:ml-16 md:w-[calc(100%-4rem)]"
            : "md:ml-[16%] md:w-[84%]"
        }`}
      >
        <main className="py-4">
          <Navbar sidebarCollapsed={sidebarCollapsed} />
          <ScrollToTop />
          <TourProvider>
            <div className="mt-[9vh]">{children}</div>
          </TourProvider>
        </main>
      </div>
    </div>
  );
};

export default Layout;
