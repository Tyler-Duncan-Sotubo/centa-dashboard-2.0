"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Workspace = "employee" | "manager";

type Ctx = {
  workspace: Workspace;
  setWorkspace: (w: Workspace) => void;
  canEmployee: boolean;
  canManager: boolean;
  userPermissions: readonly string[];
  isSwitching: boolean; // ✅ expose so UI can block renders during switch
};

const WorkspaceContext = createContext<Ctx | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession(); // ✅ pull update
  const router = useRouter();

  const userPermissions = useMemo<readonly string[]>(
    () => session?.permissions ?? [],
    [session?.permissions],
  );

  const canManager = userPermissions.includes("dashboard.login");
  const canEmployee = userPermissions.includes("ess.login");

  const [workspace, setWs] = useState<Workspace>("employee");
  const [isSwitching, setIsSwitching] = useState(false); // ✅ switching guard

  const setWorkspace = async (w: Workspace) => {
    if ((w === "manager" && !canManager) || (w === "employee" && !canEmployee))
      return;

    if (w === workspace) return; // ✅ no-op if already on this workspace

    setIsSwitching(true);
    try {
      setWs(w);

      if (typeof window !== "undefined") {
        window.localStorage.setItem("workspace", w);
      }

      // ✅ sync NextAuth session so user.id, activeWorkspace update server-side
      await update({ activeWorkspace: w });
      await update(); // force re-fetch so client session is fresh

      router.refresh(); // ✅ re-runs server components with updated session
    } finally {
      setIsSwitching(false);
    }
  };

  /**
   * 🔒 Resolve workspace deterministically whenever permissions change
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem("workspace") as Workspace | null;

    let target: Workspace | null = null;

    // 1️⃣ Saved preference (only if still allowed)
    if (saved === "manager" && canManager) target = "manager";
    else if (saved === "employee" && canEmployee) target = "employee";
    // 2️⃣ Manager ALWAYS takes precedence
    else if (canManager) target = "manager";
    // 3️⃣ Fallback to employee
    else if (canEmployee) target = "employee";

    // 4️⃣ Apply if changed — no need to call update() here, this is
    //    initial resolution on mount, not a user-triggered switch
    if (target && target !== workspace) {
      setWs(target);
      window.localStorage.setItem("workspace", target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManager, canEmployee]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        setWorkspace,
        canEmployee,
        canManager,
        userPermissions,
        isSwitching,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx)
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
