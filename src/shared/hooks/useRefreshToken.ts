"use client";

import { useSession, signOut } from "next-auth/react";

interface BackendTokens {
  accessToken: string; // e.g. JWT string used for API calls
  refreshToken: string; // e.g. refresh token string
  expiresIn: number; // how many seconds until accessToken expires
}

export const useRefreshToken = () => {
  const { data: session } = useSession();

  async function refreshToken() {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`,
      {
        method: "POST",
        headers: {
          authorization: `Refresh ${session?.backendTokens?.refreshToken}`,
        },
      },
    );

    if (!resp.ok) {
      signOut();
    }

    const refreshedTokens: BackendTokens = await resp.json();

    if (session && session.backendTokens) {
      session.backendTokens.accessToken = refreshedTokens.accessToken;
    } else {
      signOut();
    }
  }

  return refreshToken;
};
