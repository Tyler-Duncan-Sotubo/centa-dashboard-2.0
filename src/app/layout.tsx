import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/shared/ui/toaster";
import { Suspense } from "react";
import { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import { NextAuthProvider } from "@/lib/provider/nextAuthProvider";
import ReactQueryProvider from "@/lib/provider/ReactQueryProvider";
import { WorkspaceProvider } from "@/shared/context/workspace";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Centa: From Input to Impact—Flawless HR Flow.",
  description: "Powering Payroll, Empowering People.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="antialiased">
        <NextAuthProvider>
          <WorkspaceProvider>
            <ReactQueryProvider>
              <Suspense
                fallback={
                  <div className="flex justify-center items-center h-screen">
                    Loading...
                  </div>
                }
              >
                {children}
              </Suspense>
            </ReactQueryProvider>
          </WorkspaceProvider>
        </NextAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
