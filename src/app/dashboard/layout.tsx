"use client";

import { useState } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import Navbar from "@/components/navigation/Navbar";
import ScrollToTop from "@/components/navigation/ScrollToTop";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
            ? "md:ml-[4rem] md:w-[calc(100%-4rem)]"
            : "md:ml-[16%] md:w-[84%]"
        }`}
      >
        <main className="py-4">
          <Navbar sidebarCollapsed={sidebarCollapsed} />
          <ScrollToTop />
          <div className="mt-[9vh]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
