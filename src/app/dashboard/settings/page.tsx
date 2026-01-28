"use client";

import { settingsItems } from "@/features/settings/config/settings.data";
import SettingsSection from "./_components/SettingsSection";

export default function SettingsPage() {
  const grouped = settingsItems.reduce<Record<string, typeof settingsItems>>(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {},
  );

  return (
    <div className="">
      {Object.entries(grouped).map(([category, items]) => (
        <SettingsSection key={category} title={category} items={items} />
      ))}
    </div>
  );
}
