"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Skeleton } from "@/shared/ui/skeleton";
import { User } from "lucide-react";
import EmployeeProfileModal from "./EmployeeProfileModal";

type TeamNode = {
  id: string;
  name: string;
  title?: string;
  managerId: string | null;
  avatar: string | null;
};

type MyTeamContextResponse = {
  me: TeamNode;
  manager: TeamNode | null;
  peers: TeamNode[];
  directReports: TeamNode[];
};

const shortName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  if (!first) return "";
  if (!last || last === first) return first;
  return `${first} ${last[0].toUpperCase()}.`;
};

export default function MyTeamRow() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const employeeId = session?.employeeId ?? (session?.user as any)?.id ?? null;
  const enabled = status === "authenticated" && !!employeeId;

  const { data, isLoading } = useQuery<MyTeamContextResponse>({
    queryKey: ["my-team-context", employeeId],
    enabled,
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/org-chart/my-team-context/${employeeId}`,
      );
      return res.data.data;
    },
  });

  if (status === "loading" || isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (!data) return null;

  // Team context = peers + me
  const others = [...data.peers].sort((a, b) => a.name.localeCompare(b.name));
  const teamMembers: TeamNode[] = [data.me, ...others];

  return (
    <div className="w-full my-10">
      {data.manager && (
        <div className="text-sm text-muted-foreground mb-2">
          Reporting to{" "}
          <span className="font-bold text-foreground">{data.manager.name}</span>
          {data.manager.title ? ` • ${data.manager.title}` : ""}
        </div>
      )}

      <p className="text-xl font-bold text-foreground mb-2 mt-6">My Team</p>

      <div className="flex md:flex-wrap gap-6 overflow-x-auto md:overflow-visible no-scrollbar py-1 mt-5">
        {teamMembers.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setSelectedId(m.id);
              setOpen(true);
            }}
            className="flex flex-col items-center shrink-0 focus:outline-none cursor-pointer"
          >
            <Avatar className="w-14 h-14">
              <AvatarImage src={m.avatar ?? undefined} alt={m.name} />
              <AvatarFallback>
                <User className="w-7 h-7 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>

            <div className="mt-3 text-xs font-bold text-muted-foreground whitespace-nowrap">
              {m.id === data.me.id ? "Me" : shortName(m.name)}
            </div>
          </button>
        ))}
      </div>

      <EmployeeProfileModal
        employeeId={selectedId}
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setSelectedId(null);
        }}
      />
    </div>
  );
}
