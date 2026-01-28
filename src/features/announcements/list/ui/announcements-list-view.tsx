"use client";

import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import ErrorState from "@/shared/ui/error-state";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import { FaCirclePlus } from "react-icons/fa6";

import CategorySidebar from "@/features/announcements/categories/ui/category-sidebar";
import AnnouncementCard from "@/features/announcements/list/ui/announcement-card";
import { useAnnouncementsList } from "../hooks/use-announcements-list";

export function AnnouncementsListView() {
  const {
    selectedCategory,
    setSelectedCategory,
    fullCategories,
    filteredAnnouncements,
    isLoading,
    isError,
    retry,
  } = useAnnouncementsList();

  if (isLoading) return <Loading />;

  if (isError) {
    return (
      <ErrorState
        message="Error fetching announcements or categories."
        onRetry={retry}
        isLoading={isLoading}
      />
    );
  }

  return (
    <section className="p-5">
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

      <div className="grid grid-cols-12 gap-10 mt-7">
        <div className="col-span-4">
          <CategorySidebar
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            categories={fullCategories}
            numberOfAnnouncements={filteredAnnouncements.length}
          />
        </div>

        <div className="col-span-8">
          <div className="space-y-6">
            {filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map((a) => (
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
