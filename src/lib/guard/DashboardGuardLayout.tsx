import { redirect } from "next/navigation";
import { auth } from "../auth";

const ADMIN_ROLES = ["admin", "super_admin", "hr_manager", "manager"] as const;

function normalizeRole(value: string) {
  return value.trim().toLowerCase();
}

function isAdminRole(role: unknown): boolean {
  const roles: string[] = Array.isArray(role)
    ? role.filter((r): r is string => typeof r === "string")
    : typeof role === "string"
      ? [role]
      : [];

  const allowed = new Set<string>(ADMIN_ROLES);

  return roles.some((r) => allowed.has(normalizeRole(r)));
}

export default async function DashboardGuardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Not logged in -> login
  if (!session?.user) {
    redirect("/login");
  }

  const user: any = session.user;
  const allowed = isAdminRole(user?.role);

  // Logged in, but not allowed -> send to correct employee area
  if (!allowed) {
    const destination =
      user?.employmentStatus === "onboarding" ? "/onboarding" : "/ess";
    redirect(destination);
  }

  // Allowed -> render dashboard subtree
  return <>{children}</>;
}
