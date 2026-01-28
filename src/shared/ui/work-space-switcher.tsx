"use client";

import { useWorkspace } from "@/shared/context/workspace";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo } from "react";

function mapTwinPath(path: string, to: "manager" | "employee") {
  if (to === "manager") {
    return path.replace(/^\/ess.*$/i, "/dashboard") || "/dashboard";
  }
  return path.replace(/^\/dashboard.*$/i, "/ess") || "/ess";
}

export const WorkspaceSwitcher = () => {
  const { workspace, setWorkspace, canEmployee, canManager } = useWorkspace();
  const { update } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // Switch is "checked" when in manager context
  const checked = workspace === "manager";

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
      // 1) Persist on NextAuth JWT so session.user.id flips server/client
      await update({ activeWorkspace: to });

      // 2) Remember last route for each workspace
      const nextPath = mapTwinPath(pathname, to);
      const key = to === "manager" ? "last_mgr" : "last_emp";
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, nextPath);
      }

      // 3) Update local workspace context (keeps UI in sync instantly)
      setWorkspace(to);

      // 4) Navigate
      router.push(nextPath);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {canToggle && (
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-monzo-brand/40">
          <Label htmlFor="workspace-switch" className="text-sm font-medium">
            {checked ? "Work" : "My HR"}
          </Label>
          <Switch
            id="workspace-switch"
            checked={checked}
            onCheckedChange={(on) => {
              if (on) go("manager");
              else go("employee");
            }}
            disabled={!canToggle || busy}
            aria-label="Switch workspace"
            aria-pressed={checked}
          />
        </div>
      )}
    </>
  );
};
