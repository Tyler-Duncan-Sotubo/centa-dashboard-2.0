"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Loading from "../ui/loading";

export function ClientGuard({
  need,
  onMissing = "/ess",
  children,
  loading = <Loading />,
}: {
  need: readonly string[];
  onMissing?: string;
  children: React.ReactNode;
  loading?: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const perms = (session?.permissions ?? []) as string[];

  if (status === "loading") return loading;
  if (!session) {
    router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
    return null;
  }
  const ok = need.every((p) => perms.includes(p));
  if (!ok) {
    router.replace(onMissing);
    return null;
  }
  return <>{children}</>;
}
