"use client";
import { useSearchParams } from "next/navigation";

export default function OAuthErrorPage() {
  const params = useSearchParams();
  const error = params.get("error");

  const errorMessage =
    {
      OAuthCallback: "There was a problem connecting your Google account.",
      OAuthSignin: "Unable to sign in with Google. Please try again.",
    }[error || ""] || "An unexpected error occurred.";

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-red-600">
        Google Integration Error
      </h1>
      <p className="mt-4">{errorMessage}</p>
    </div>
  );
}
