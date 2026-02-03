"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRefreshToken } from "./useRefreshToken";
import { axiosInstance } from "@/lib/axios";
import { logClientEvent } from "@/lib/logger/client-logger";

const useAxiosAuth = () => {
  const { data: session } = useSession();
  const refreshToken = useRefreshToken();

  useEffect(() => {
    const requestIntercept = axiosInstance.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] =
            `Bearer ${session?.backendTokens?.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseIntercept = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        const status = error?.response?.status;
        const url = prevRequest?.url;
        const method = prevRequest?.method;

        // Handle refresh flow
        if (status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;

          try {
            await refreshToken();
            prevRequest.headers["Authorization"] =
              `Bearer ${session?.backendTokens?.accessToken}`;
            return axiosInstance(prevRequest);
          } catch (refreshErr) {
            // Refresh failed -> log this (high signal)
            logClientEvent("error", "Auth refresh failed", {
              kind: "auth_refresh_failed",
              url,
              method,
              status,
              originalMessage: error?.message,
              refreshMessage: (refreshErr as any)?.message,
            });
            return Promise.reject(refreshErr);
          }
        }

        // Log other errors (and optionally 401 after refresh attempt)
        // Skip cancellations / aborted requests
        const code = error?.code;
        if (code !== "ERR_CANCELED") {
          logClientEvent("error", "API request failed", {
            kind: "axios_error",
            url,
            method,
            status,
            code,
            message: error?.message,
            responseData: error?.response?.data,
            // Never send Authorization headers (client-logger sanitizes too)
            headers: prevRequest?.headers,
          });
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestIntercept);
      axiosInstance.interceptors.response.eject(responseIntercept);
    };
  }, [session, refreshToken]);

  return axiosInstance;
};

export default useAxiosAuth;
