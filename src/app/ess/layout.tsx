"use client";

import { ReactNode, useEffect, useState } from "react";
import ApplicationLogo from "@/shared/ui/applicationLogo";
import { useSession, signOut } from "next-auth/react";
import ScrollToTop from "@/features/admin-layout/ui/scroll-to-top";
import EssSidebar from "@/features/ess-layout/ui/ess-sidebar";
import EssNavbar from "@/features/ess-layout/ui/ess-navbar";
import { useRouter } from "next/navigation";
import Loading from "@/shared/ui/loading";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { AuthProvider } from "@/shared/context/AuthContext";
import { EssMobileAppNav } from "@/features/ess-layout/ui/ess-mobile-app-nav";
import { cn } from "@/lib/utils";
import { MdLogout } from "react-icons/md";
import { ZendeskWidget } from "@/shared/widgets/zendesk";
export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session && status !== "loading") {
      router.replace("/login");
    } else if (session && session.user.employmentStatus === "onboarding") {
      router.replace("/login");
    }
  }, [session, status, router]);

  if (status === "loading") return <Loading />;
  if (!session) return null;

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
              ? "md:ml-16 md:w-[calc(100%-4rem)]"
              : "md:ml-[16%] md:w-[calc(100%-16%)]"
          }`}
        >
          {/* Desktop Header */}
          <EssNavbar sidebarCollapsed={sidebarCollapsed} />

          {/* Mobile Header */}
          <header className="flex justify-between items-center px-3 md:hidden">
            <ApplicationLogo
              className="h-16 w-28"
              src="https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/55df5e55-f3e0-44c6-a39f-390ef8466d56/9a3be800-ca54-4bf9-a3ed-72b68baf52f7/1768990436384-logo-CqG_6WrI.svg"
              alt="website logo"
              link="/ess"
            />
            <div className="p-2 ">
              <button
                onClick={() => signOut()}
                className={cn(
                  "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  "text-monzo-error hover:bg-muted/60",
                )}
              >
                <MdLogout size={18} />
                <span>Logout</span>
              </button>
            </div>
          </header>

          <ScrollToTop />
          <ZendeskWidget />
          <div className="sm:mt-[12vh] mt-[3vh] px-5 z-9999">{children}</div>

          {/* ✅ Mobile bottom nav */}
          <EssMobileAppNav />
        </main>
      </div>
    </AuthProvider>
  );
}
