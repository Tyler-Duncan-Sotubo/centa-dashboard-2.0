"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) return router.replace("/login");
    if (session.user.employmentStatus !== "onboarding")
      return router.replace("/dashboard");
  }, [session, status, router]);

  if (status === "loading" || !session) return null;
  return <main>{children}</main>;
}
