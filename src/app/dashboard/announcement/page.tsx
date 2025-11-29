"use client";

import { useState } from "react";
import CategorySidebar from "./_components/CategorySidebar";
import AnnouncementCard from "./_components/AnnouncementCard";
import PageHeader from "@/components/pageHeader";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Announcement } from "@/types/announcements.type";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import ErrorState from "@/components/ErrorState";
import { FaCirclePlus } from "react-icons/fa6";

export default function AnnouncementPage() {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const axiosAuth = useAxiosAuth();

  const fetchAnnouncement = async () => {
    try {
      const res = await axiosAuth.get("/api/announcement");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const {
    data,
    isLoading,
    isError,
    refetch: refetchAnnouncements,
  } = useQuery<Announcement[]>({
    queryKey: ["announcement"],
    queryFn: fetchAnnouncement,
    enabled: !!session?.backendTokens.accessToken,
  });

  const fetchCategories = async () => {
    try {
      const res = await axiosAuth.get("/api/announcement/category");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: !!session?.backendTokens.accessToken,
  });

  const fullCategories = [
    { id: "all", name: "All Announcements" },
    ...categories,
  ];

  if (isLoadingCategories || isLoading) return <Loading />;
  if (isCategoriesError || isError)
    return (
      <ErrorState
        message="Error fetching announcements or categories."
        onRetry={() => {
          refetchAnnouncements();
          refetchCategories();
        }}
        isLoading={isLoading || isLoadingCategories}
      />
    );

  const filteredAnnouncements =
    selectedCategory === "all"
      ? data
      : data?.filter((a) => a.categoryId === selectedCategory);

  return (
    <section className="p-5">
      <div>
        <PageHeader
          title="Announcements"
          description="Stay updated with the latest company announcements."
        >
          <Link href="/dashboard/announcement/create">
            <Button>
              <FaCirclePlus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </Link>
        </PageHeader>
      </div>

      <div className="grid grid-cols-12 gap-10 mt-7">
        <div className="col-span-4">
          <CategorySidebar
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            categories={fullCategories}
            numberOfAnnouncements={filteredAnnouncements?.length}
          />
        </div>
        <div className="col-span-8">
          <div className="space-y-6">
            {(filteredAnnouncements ?? []).length > 0 ? (
              (filteredAnnouncements ?? []).map((a) => (
                <AnnouncementCard key={a.id} announcement={a} />
              ))
            ) : (
              <p className="text-lg text-center">
                No announcement yet. Create one!
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
