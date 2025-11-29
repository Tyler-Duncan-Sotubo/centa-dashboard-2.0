import { Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import { NextAuthProvider } from "@/server/provider/nextAuthProvider";
import ReactQueryProvider from "@/server/provider/ReactQueryProvider";
import { WorkspaceProvider } from "@/context/workspace";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Centa: From Input to Impact—Flawless HR Flow.",
  description: "Powering Payroll, Empowering People.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans antialiased`}>
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
