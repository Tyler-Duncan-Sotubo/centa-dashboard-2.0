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
        const code = error?.code;

        // ✅ Retry on Railway DNS/connection blips before anything else
        if (
          (code === "ERR_NAME_NOT_RESOLVED" ||
            code === "ERR_NETWORK" ||
            code === "ECONNREFUSED") &&
          !prevRequest?._retried
        ) {
          prevRequest._retried = true;
          await new Promise((res) => setTimeout(res, 1500));

          logClientEvent("warn", "Network blip — retrying request", {
            kind: "network_retry",
            url,
            method,
            code,
          });

          return axiosInstance(prevRequest);
        }

        // Handle refresh flow
        if (status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;

          try {
            await refreshToken();
            prevRequest.headers["Authorization"] =
              `Bearer ${session?.backendTokens?.accessToken}`;
            return axiosInstance(prevRequest);
          } catch (refreshErr) {
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
