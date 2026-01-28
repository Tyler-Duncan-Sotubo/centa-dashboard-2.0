"use client";

import { AddCategoryModal } from "@/features/announcements/categories/ui/add-category-modal";

export default function CategorySidebar({
  selected,
  onSelect,
  categories,
  numberOfAnnouncements,
}: {
  selected: string;
  onSelect: (id: string) => void;
  categories: { id: string; name: string }[];
  numberOfAnnouncements?: number;
}) {
  return (
    <div className="p-4 border rounded bg-gray-200 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold">Categories</h2>
        <AddCategoryModal />
      </div>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className={`cursor-pointer p-2 space-x-6 flex justify-between ${
              selected === cat.id
                ? "font-bold bg-white rounded-md shadow-2xs"
                : ""
            }`}
            onClick={() => onSelect(cat.id)}
          >
            <span>{cat.name}</span>
            <span
              className={`${
                numberOfAnnouncements && selected === cat.id
                  ? "bg-monzo-background text-monzo-textPrimary w-6 h-6 flex justify-center rounded-full"
                  : ""
              }`}
            >
              {numberOfAnnouncements && selected === cat.id
                ? numberOfAnnouncements
                : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
