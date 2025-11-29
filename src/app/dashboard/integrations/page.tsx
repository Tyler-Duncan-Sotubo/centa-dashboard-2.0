"use client";

import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";
import { FaPlus } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";

const IntegrationsPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchGoogle = async () => {
    try {
      const res = await axiosInstance.get("/api/google");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["google"],
    queryFn: fetchGoogle,
    enabled: !!session?.backendTokens.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;

  const handleConnect = async () => {
    const res = await fetch("/api/integrations/google");
    const { url } = await res.json();
    window.location.href = url; // Redirect to Google
  };

  return (
    <section className="px-5">
      <PageHeader
        title="Integrations"
        description="Connect your account with third-party services to enhance functionality."
      />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="border shadow-sm rounded-lg p-4 flex flex-col space-y-10">
          <div className="flex gap-4 mb-4 flex-col space-y-2">
            <div className="flex items-center justify-center w-14 h-14 bg-gray-200 rounded-full">
              <FcGoogle size={28} />
            </div>
            <div>
              <p className="text-md font-bold text-gray-600">Google</p>
              <h2 className="text-sm">Identity Provider</h2>
            </div>
          </div>

          <div className="flex justify-start">
            {data && data.id ? (
              <Button variant="secondary" className="w-full" disabled>
                Connected
              </Button>
            ) : (
              <Button onClick={handleConnect} variant="link" className="p-0">
                <FaPlus /> Connect
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntegrationsPage;
