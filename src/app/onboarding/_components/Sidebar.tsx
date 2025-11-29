"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChecklistItem } from "@/types/onboarding.type";

export default function Sidebar({
  checklist,
  currentIndex,
  jump,
  completedIds,
}: {
  checklist: ChecklistItem[];
  currentIndex: number; // 0-based index of the current step
  jump: (index: number) => void; // navigate by index
  completedIds: Set<string>; // completed step ids
}) {
  return (
    <nav className="w-72 p-4 border-r space-y-2 bg-monzo-background hidden md:block">
      <h2 className="text-lg font-semibold mb-4 text-monzo-textPrimary">
        Your Tasks
      </h2>

      {checklist.map((item, index) => {
        const isActive = index === currentIndex;
        const isChecked = completedIds.has(item.id);

        return (
          <Label
            key={item.id}
            onClick={() => jump(index)}
            className={`cursor-pointer hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 transition-all
              ${
                isActive
                  ? "border-monzo-brand text-monzo-textPrimary"
                  : "border-gray-200 text-monzo-textPrimary"
              }
              has-[[aria-checked=true]]:border-monzo-brand has-[[aria-checked=true]]:bg-monzo-brand
            `}
          >
            <Checkbox
              checked={isChecked}
              className="data-[state=checked]:border-monzo-success data-[state=checked]:bg-monzo-success data-[state=checked]:hover:bg-monzo-success/80 data-[state=checked]:focus:ring-monzo-success/50 data-[state=checked]:focus:ring-offset-2 data-[state=checked]:focus:ring-offset-white"
            />
            <div className="grid gap-1 font-normal">
              <p className="text-sm leading-none font-medium text-monzo-textPrimary">
                {item.title}
              </p>
            </div>
          </Label>
        );
      })}
    </nav>
  );
}
