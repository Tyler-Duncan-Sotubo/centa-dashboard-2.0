"use client";

import { cn } from "@/lib/utils";
import { useWorkspace } from "@/shared/context/workspace";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function mapTwinPath(path: string, to: "manager" | "employee") {
  if (to === "manager")
    return path.replace(/^\/ess.*$/i, "/dashboard") || "/dashboard";
  return path.replace(/^\/dashboard.*$/i, "/ess") || "/ess";
}

export const WorkspaceSwitcher = () => {
  const { workspace, setWorkspace, canEmployee, canManager } = useWorkspace();
  const { update } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const canToggle = useMemo(
    () => canEmployee && canManager,
    [canEmployee, canManager],
  );

  const go = async (to: "manager" | "employee") => {
    if (busy) return;
    if (
      (to === "manager" && !canManager) ||
      (to === "employee" && !canEmployee)
    )
      return;

    setBusy(true);
    try {
      await update({ activeWorkspace: to });

      const nextPath = mapTwinPath(pathname, to);
      const key = to === "manager" ? "last_mgr" : "last_emp";
      if (typeof window !== "undefined")
        window.localStorage.setItem(key, nextPath);

      setWorkspace(to);
      router.push(nextPath);
    } finally {
      setBusy(false);
    }
  };

  if (!canToggle) return null;

  const active = workspace; // "manager" | "employee"

  return (
    <div
      className="inline-flex items-center rounded-lg bg-monzo-brand/40 p-1"
      role="tablist"
      aria-label="Workspace"
    >
      <button
        type="button"
        role="tab"
        aria-selected={active === "employee"}
        disabled={busy}
        onClick={() => go("employee")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition cursor-pointer",
          active === "employee"
            ? "bg-monzo-background text-white shadow"
            : "text-white/80 hover:text-white",
          busy && "opacity-60",
        )}
      >
        My HR
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={active === "manager"}
        disabled={busy}
        onClick={() => go("manager")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition cursor-pointer",
          active === "manager"
            ? "bg-monzo-background text-white shadow"
            : "text-white/80 hover:text-white",
          busy && "opacity-60",
        )}
      >
        Work
      </button>

      {busy && <span className="ml-2 text-xs text-white/80">Switching…</span>}
    </div>
  );
};
