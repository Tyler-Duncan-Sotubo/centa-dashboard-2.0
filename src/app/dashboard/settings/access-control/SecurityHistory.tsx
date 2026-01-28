"use client";

import Loading from "@/shared/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { AuditLog } from "@/types/audit.type";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { AuditTable } from "../audit-logs/_components/audit.table";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const SecurityHistoryPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchAudit = async () => {
    try {
      const res = await axiosInstance.get("/api/audit/authentication-logs");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading } = useQuery<AuditLog[] | undefined>({
    queryKey: ["audit"],
    queryFn: fetchAudit,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  if (status === "loading" || isLoading) return <Loading />;

  return (
    <section className="">
      <AuditTable data={data} />
    </section>
  );
};

export default SecurityHistoryPage;
