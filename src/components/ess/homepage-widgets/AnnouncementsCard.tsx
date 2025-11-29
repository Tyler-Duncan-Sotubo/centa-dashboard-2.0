"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IoMdMegaphone } from "react-icons/io";
import { format } from "date-fns";
import Link from "next/link";

type Announcement = {
  id: string;
  title: string;
  body: string;
  category: string;
  createdAt: string;
};

export default function AnnouncementsCard({
  announcements,
}: {
  announcements: Announcement[];
}) {
  function stripHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }

  return (
    <Card>
      <CardHeader className="flex gap-2 border-b pb-2">
        <CardTitle className="flex gap-2 items-center text-base font-semibold">
          <IoMdMegaphone className="w-5 h-5 text-monzo-brand" />
          Announcements
        </CardTitle>
      </CardHeader>

      <CardContent className="mt-5 p-0 pb-5">
        {announcements.map((a) => (
          <div key={a.id}>
            <Link
              href={`/ess/announcement/${a.id}`}
              className="text-sm font-semibold text-monzo-brand hover:bg-slate-50 py-3 px-4 flex flex-col gap-1"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-md font-medium text-foreground">
                  {a.title}
                </h3>
                <p className="text-sm font-bold text-monzo-brand">
                  {a.category}
                </p>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {stripHtml(a.body)}
              </p>
              <span className="text-xs text-muted-foreground mt-1">
                {format(new Date(a.createdAt), "PPP")}
              </span>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
