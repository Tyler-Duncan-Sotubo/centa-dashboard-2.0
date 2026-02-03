"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log silently (Sentry, LogRocket, etc.)
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h1>

          <p className="text-gray-600 mb-6">
            We hit an unexpected issue. Your data is safe — please choose an
            option below to continue.
          </p>

          <div className="flex flex-col gap-3">
            <Button onClick={() => reset()}>Try again</Button>

            <Button variant={"outline"} onClick={() => router.push("/login")}>
              Go to login
            </Button>

            <button
              onClick={() => router.push("/")}
              className="w-full text-sm text-gray-500 hover:underline"
            >
              Back to home
            </button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">
                Error details (dev only)
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
