"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaClock,
  FaListUl,
  FaCheck,
  FaUsers,
  FaTasks,
  FaBuilding,
  FaCommentDots,
} from "react-icons/fa";
import PageHeader from "@/shared/ui/page-header";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import ReviewList from "../_components/ReviewList";
import ReviewFormModal from "../_components/ReviewFormModal";
import { Review } from "@/types/performance/review.type";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import { useParams, useRouter } from "next/navigation";

export default function ReviewsByCyclePage() {
  const params = useParams<{ cycleId: string }>();
  const cycleId = params?.cycleId;

  const router = useRouter();
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [open, setOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 700);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch departments + cycles (to populate selects and allow navigation)
  const {
    data,
    isLoading: isLoadingMeta,
    isError,
  } = useQuery({
    queryKey: ["departments-and-cycles"],
    queryFn: async () => {
      const [departmentsRes, cyclesRes] = await Promise.all([
        axios.get("/api/department"),
        axios.get("/api/performance-cycle"),
      ]);

      return {
        departments: departmentsRes.data.data,
        cycles: cyclesRes.data.data,
      };
    },
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  const cycleName = useMemo(() => {
    if (!data?.cycles?.length) return "Cycle";
    return data.cycles.find((c: any) => c.id === cycleId)?.name ?? "Cycle";
  }, [data?.cycles, cycleId]);

  // Reviews (cycle-scoped)
  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ["reviews", cycleId, status, debouncedSearch, department],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("cycleId", cycleId); // ✅ required (cycle-scoped)
      if (status !== "all") params.append("status", status);
      if (debouncedSearch.trim()) params.append("search", debouncedSearch);
      if (department !== "all") params.append("departmentId", department);

      const res = await axios.get(
        `/api/performance-assessments/dashboard?${params.toString()}`,
      );
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken && !!cycleId,
  });

  // Counts (cycle-scoped)
  const { data: counts, isLoading: isLoadingCounts } = useQuery({
    queryKey: ["reviews-counts", cycleId, department],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("cycleId", cycleId); // ✅ required
      if (department !== "all") params.append("departmentId", department);

      const res = await axios.get(
        `/api/performance-assessments/counts?${params.toString()}`,
      );
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken && !!cycleId,
  });

  if (isLoadingMeta || isLoadingReviews || isLoadingCounts) return <Loading />;

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load data. Please try again.</p>
      </div>
    );
  }

  return (
    <section className="p-6 space-y-12">
      <PageHeader
        title={`Appraisal — ${cycleName}`}
        description="Track and manage manager–employee conversations"
        icon={<FaCommentDots size={25} />}
      >
        <Button onClick={() => setOpen(true)}>
          <FaListUl className="mr-2 w-4 h-4" />
          New Review
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Input
          placeholder="Search employee"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80"
          leftIcon={<FaListUl />}
        />

        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-72">
            <FaBuilding className="mr-2 w-4 h-4" />
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {data?.departments?.map((d: { id: string; name: string }) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Cycle switcher (navigates to another [cycleId]) */}
        <Select
          value={cycleId}
          onValueChange={(val) =>
            router.push(`/dashboard/performance/reviews/${val}`)
          }
        >
          <SelectTrigger className="w-72">
            <SelectValue placeholder="Select Cycle" />
          </SelectTrigger>
          <SelectContent>
            {data?.cycles?.map((c: { id: string; name: string }) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={status} onValueChange={setStatus} className="space-y-4 mt-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all">
            <FaUsers className="mr-2 w-4 h-4 text-monzo-brandDark" />
            All
            {!!counts?.all && (
              <span className="ml-2 text-md bg-monzo-brandDark text-white px-2 rounded">
                {counts.all}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="not_started">
            <FaTasks className="mr-2 w-4 h-4 text-muted-foreground" />
            Not Started
            {!!counts?.not_started && (
              <span className="ml-2 text-md bg-muted-foreground text-white px-2 rounded">
                {counts.not_started}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="in_progress">
            <FaClock className="mr-2 w-4 h-4 text-monzo-secondary" />
            In Progress
            {!!counts?.in_progress && (
              <span className="ml-2 text-md bg-monzo-secondary text-white px-2 rounded">
                {counts.in_progress}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="submitted">
            <FaCheck className="mr-2 w-4 h-4 text-monzo-success" />
            Submitted
            {!!counts?.submitted && (
              <span className="ml-2 text-md bg-monzo-success text-white px-2 rounded">
                {counts.submitted}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div>
          {isLoadingReviews ? (
            <div className="space-y-2 mt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <ReviewList filteredReviews={reviews as Review[]} />
          )}
        </div>
      </Tabs>

      <ReviewFormModal open={open} setOpen={setOpen} />
    </section>
  );
}
