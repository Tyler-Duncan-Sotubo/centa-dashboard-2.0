"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "@/lib/utils";

const avatarColors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
];

const getColorClass = (name: string) => {
  if (!name || !name.trim()) return avatarColors[0];
  const hash = Array.from(name).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );
  return avatarColors[hash % avatarColors.length];
};

type Size = "sm" | "md" | "lg" | "xlg";

const SIZE_MAP: Record<Size, { container: string; text: string }> = {
  sm: { container: "w-8 h-8", text: "text-[10px]" },
  md: { container: "w-10 h-10", text: "text-xs" },
  lg: { container: "w-12 h-12", text: "text-sm" },
  xlg: { container: "w-28 h-28", text: "text-4xl" },
};

type Props = {
  name?: string;
  src?: string | null;
  size?: Size;
  className?: string;
};

export function Avatars({ name, src, size = "md", className }: Props) {
  const safeName = name?.trim() || "";
  const initials = safeName
    ? safeName
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "NA";

  const bgClass = getColorClass(safeName);
  const s = SIZE_MAP[size];

  return (
    <Avatar className={cn(s.container, className)}>
      {src && <AvatarImage src={src} alt={safeName} />}
      <AvatarFallback>
        <div
          className={cn(
            "w-full h-full rounded-full flex items-center justify-center font-semibold text-white",
            bgClass,
            s.text,
          )}
        >
          {initials}
        </div>
      </AvatarFallback>
    </Avatar>
  );
}
