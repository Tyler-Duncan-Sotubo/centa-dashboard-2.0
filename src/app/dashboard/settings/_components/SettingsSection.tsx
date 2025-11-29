"use client";

import Link from "next/link";

interface SettingItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

export default function SettingsSection({
  title,
  items,
}: {
  title: string;
  items: SettingItem[];
}) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {items.map((item) => (
          <Link key={item.link} href={item.link}>
            <div className="hover:bg-sidebar rounded-md transition-shadow h-full p-4 flex items-start gap-5">
              <div className="flex flex-row items-center gap-4">
                <div className="text-brand bg-sidebar w-12 h-12 flex justify-center items-center rounded-full">
                  {item.icon}
                </div>
              </div>
              <div>
                <h2 className="text-lg text-brand font-semibold">
                  {item.title}
                </h2>
                <p className="text-md text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
