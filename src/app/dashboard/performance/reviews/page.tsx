"use client";

import { useEffect, useState } from "react";
import {
  FaClock,
  FaListUl,
  FaCheck,
  FaUsers,
  FaTasks,
  FaBuilding,
  FaCommentDots,
} from "react-icons/fa";
import PageHeader from "@/components/pageHeader";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewList from "./_components/ReviewList";
import { Review } from "@/types/performance/review.type";
import ReviewFormModal from "./_components/ReviewFormModal";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";

export default function ReviewsPage() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [cycle, setCycle] = useState("all");
  const [open, setOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1000); // 400ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ["reviews", status, debouncedSearch, department, cycle],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== "all") params.append("status", status);
      if (debouncedSearch.trim()) params.append("search", debouncedSearch);
      if (department !== "all") params.append("departmentId", department);
      if (cycle !== "all") params.append("cycleId", cycle);

      const res = await axios.get(
        `/api/performance-assessments/dashboard?${params}`
      );
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  const { data, isLoading, isError } = useQuery({
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
    enabled: !!session?.backendTokens.accessToken,
  });

  const { data: counts, isLoading: isLoadingCounts } = useQuery({
    queryKey: ["reviews-counts"],
    queryFn: async () => {
      const res = await axios.get("/api/performance-assessments/counts");
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (isLoading || isLoadingReviews || isLoadingCounts) return <Loading />;
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
        title="1:1 Check-Ins"
        description="Track and manage manager–employee conversations"
        icon={<FaCommentDots size={25} />}
      >
        <Button onClick={() => setOpen(true)}>
          <FaListUl className="mr-2 w-4 h-4" />
          New Review
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center max-w-3xl gap-4">
        <Input
          placeholder="Search employee"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80"
          leftIcon={<FaListUl />}
        />

        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-96">
            <FaBuilding className="mr-2 w-4 h-4" />
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {data?.departments.map((d: { id: string; name: string }) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={cycle} onValueChange={setCycle}>
          <SelectTrigger className="w-96">
            <SelectValue placeholder="All Cycles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cycles</SelectItem>
            {data?.cycles.map((c: { id: string; name: string }) => (
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
            {counts?.all > 0 && (
              <span className="ml-2  text-md bg-monzo-brandDark text-white px-2 rounded">
                {counts?.all}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="not_started">
            <FaTasks className="mr-2 w-4 h-4 text-muted-foreground" />
            Not Started
            {counts?.not_started > 0 && (
              <span className="ml-2  text-md bg-muted-foreground text-white px-2 rounded">
                {counts?.not_started}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            <FaClock className="mr-2 w-4 h-4 text-monzo-secondary" />
            In Progress
            {counts?.in_progress > 0 && (
              <span className="ml-2  text-md bg-monzo-secondary text-white px-2 rounded">
                {counts?.in_progress}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="submitted">
            <FaCheck className="mr-2 w-4 h-4 text-monzo-success" />
            Submitted
            {counts?.submitted > 0 && (
              <span className="ml-2 text-md bg-monzo-success text-white px-2 rounded">
                {counts?.submitted}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div>
          {isLoading ? (
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
      {/* Review Form Modal */}
      <ReviewFormModal open={open} setOpen={setOpen} />
    </section>
  );
}
