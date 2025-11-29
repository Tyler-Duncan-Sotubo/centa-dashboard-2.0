"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { CandidateCard } from "./_components/CandidateCard";
import { Candidate } from "@/types/candidate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/pageHeader";
import Loading from "@/components/ui/loading";

export default function CandidateList() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const {
    data: candidates,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["candidates", { search, limit, offset, sortBy, sortDirection }],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/candidates", {
        params: {
          search,
          limit,
          offset,
          sortBy,
          sortDirection,
        },
      });
      return res.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
    refetchOnMount: true,
  });

  return (
    <div className="p-5 space-y-10">
      <PageHeader title="Talent Pool" />
      <div className="flex gap-2">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && refetch()}
          className="w-[300px]"
        />

        {/* Sort By */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="createdAt">Created At</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Direction */}
        <Select
          value={sortDirection}
          onValueChange={(value: "asc" | "desc") => setSortDirection(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>

        {/* Limit */}
        <Select
          value={String(limit)}
          onValueChange={(value) => {
            setLimit(Number(value));
            setOffset(0); // Reset pagination
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <p>Error loading candidates</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {candidates?.map((candidate: Candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              Previous
            </Button>
            <Button variant="outline" onClick={() => setOffset(offset + limit)}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
