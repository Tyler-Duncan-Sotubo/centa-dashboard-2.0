"use client";
import { useSession } from "next-auth/react";
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
};

const WorkspaceContext = createContext<Ctx | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const userPermissions = useMemo<readonly string[]>(
    () => session?.permissions ?? [],
    [session?.permissions],
  );

  const canManager = userPermissions.includes("dashboard.login");
  const canEmployee = userPermissions.includes("ess.login");

  // Initial state: manager wins if allowed
  const [workspace, setWs] = useState<Workspace>("employee");

  const setWorkspace = (w: Workspace) => {
    if ((w === "manager" && !canManager) || (w === "employee" && !canEmployee))
      return;

    setWs(w);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("workspace", w);
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

    // 4️⃣ Apply if changed
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
