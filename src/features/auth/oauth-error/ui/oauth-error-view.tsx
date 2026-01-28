"use client";

import { useOAuthError } from "../hooks/use-oauth-error";

export function OAuthErrorView() {
  const { errorMessage } = useOAuthError();

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-red-600">
        Google Integration Error
      </h1>
      <p className="mt-4">{errorMessage}</p>
    </div>
  );
}
