"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const ERROR_MAP: Record<string, string> = {
  OAuthCallback: "There was a problem connecting your Google account.",
  OAuthSignin: "Unable to sign in with Google. Please try again.",
};

export function useOAuthError() {
  const params = useSearchParams();
  const error = params.get("error");

  const errorMessage = useMemo(() => {
    if (!error) return "An unexpected error occurred.";
    return ERROR_MAP[error] ?? "An unexpected error occurred.";
  }, [error]);

  return { error, errorMessage };
}
