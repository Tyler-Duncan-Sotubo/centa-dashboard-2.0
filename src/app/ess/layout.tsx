"use client";

import { ReactNode, useEffect, useState } from "react";
import ApplicationLogo from "@/components/ui/applicationLogo";
import { useSession } from "next-auth/react";
import ScrollToTop from "@/components/navigation/ScrollToTop";
import EssSidebar from "@/components/ess/navigation/ess-sidebar";
import EssNavbar from "@/components/ess/navigation/ess-navbar";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/loading";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import MobileNav from "@/components/ess/navigation/MobileNav";
import { AuthProvider } from "@/context/AuthContext";

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session && status !== "loading") {
      router.replace("/auth/login");
    } else if (session && session.user.employmentStatus === "onboarding") {
      router.replace("/auth/login");
    }
  }, [session, status, router]);

  if (status === "loading") return <Loading />;
  if (!session) return null;

  // Default layout
  return (
    <AuthProvider>
      <div className="flex">
        <EssSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />
        <main
          className={`bg-white min-h-screen transition-all ease-in-out duration-500 w-full ${
            sidebarCollapsed
              ? "md:ml-[4rem] md:w-[calc(100%-4rem)]"
              : "md:ml-[16%] md:w-[calc(100%-16%)]"
          }`}
        >
          {/* Desktop Header */}
          <EssNavbar sidebarCollapsed={sidebarCollapsed} />

          {/* Mobile Header */}
          <header className="flex justify-between items-center px-3 md:hidden">
            <ApplicationLogo
              className="h-16 w-28"
              src="https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757584746/logo_dggjny.png"
              alt="website logo"
              link="/dashboard"
            />

            <MobileNav />
          </header>

          <ScrollToTop />
          <div className="sm:mt-[12vh] mt-[3vh] px-5 z-[9999]">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
