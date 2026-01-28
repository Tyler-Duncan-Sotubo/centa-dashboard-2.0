import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export function SessionMonitor() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.backendTokens) return;

    const expiresAt = session.backendTokens.expiresIn * 1000 + Date.now(); // or session.accessTokenExpires
    const timeLeft = expiresAt - Date.now();

    const timer = setTimeout(() => {
      signOut();
    }, timeLeft);

    return () => clearTimeout(timer);
  }, [session]);

  return null;
}
