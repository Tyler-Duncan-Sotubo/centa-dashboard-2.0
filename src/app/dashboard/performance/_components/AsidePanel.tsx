// components/performance/AsidePanel.tsx
"use client";

import CurrentCycleCard from "./CurrentCycleCard";
import QuickActions from "./QuickActions";

export default function AsidePanel() {
  return (
    <aside className="space-y-4">
      <h3 className="text-lg font-semibold">Quick Actions</h3>
      <QuickActions />
      <CurrentCycleCard />
    </aside>
  );
}
