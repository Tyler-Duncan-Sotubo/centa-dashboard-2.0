"use client";

import { AuditTable } from "./_components/audit.table";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { AuditLog } from "@/types/audit.type";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

const AuditPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchAudit = async () => {
    try {
      const res = await axiosInstance.get("/api/audit/logs");
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
      <PageHeader
        title="Audit Logs"
        description="View all the audit logs for your account. Actions taken by users are logged here."
        tooltip="Audit logs are used to track changes made to the system, including who made the change and when it was made. This information can be useful for security audits, compliance, and troubleshooting."
      />
      <AuditTable data={data} />
    </section>
  );
};

export default AuditPage;
