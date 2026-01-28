"use client";

import { differenceInCalendarDays } from "date-fns";
import { useMemo } from "react";
import { useRouter } from "next/navigation"; // Import useRouter to handle navigation
import { AnnouncementCarousel, BannerItem } from "./AnnouncementCarousel";
import { Button } from "../../../shared/ui/button";
import { IoMdMegaphone } from "react-icons/io";

export default function DashboardBanner({
  nextPayDate,
  announcements = [],
}: {
  nextPayDate: string | null | undefined;
  announcements: { id: string; title: string }[] | undefined; // Array of announcement objects passed as props
}) {
  const router = useRouter(); // Initialize the router for navigation

  const banners: BannerItem[] = useMemo(() => {
    const items: BannerItem[] = [];

    // Check for the next pay date and calculate days left
    if (nextPayDate && !isNaN(new Date(nextPayDate).getTime())) {
      const today = new Date();
      const payDate = new Date(nextPayDate);
      const daysLeft = differenceInCalendarDays(payDate, today);

      items.push({
        id: "payday",
        message: `Next pay date in ${daysLeft} day${
          daysLeft !== 1 ? "s" : ""
        }.  Make sure payroll is processed on time.`,
        icon: "💰",
      });
    }

    // Add dynamic announcements from props
    announcements.forEach((announcement) => {
      items.push({
        id: announcement.id,
        message: (
          <Button
            onClick={() =>
              router.push(`/dashboard/announcement/${announcement.id}`)
            }
            variant="link"
            className="text-monzo-textPrimary hover:text-monzo-textSecondary font-semibold text-lg"
          >
            <IoMdMegaphone className="w-10 h-10 text-monzo-monzoOrange" />{" "}
            {announcement.title}
          </Button>
        ),
      });
    });

    return items;
  }, [nextPayDate, announcements, router]); // Add router to the dependency array

  return <AnnouncementCarousel banners={banners} />;
}
