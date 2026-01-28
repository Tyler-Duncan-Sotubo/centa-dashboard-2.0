"use client";

import React from "react";
import { OrgChartNodeDto } from "../types/org-chart.type";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/lib/utils";
import { Avatars } from "@/shared/ui/avatars";

type Props = {
  node: OrgChartNodeDto;
  size?: "sm" | "md" | "lg";
  active?: boolean;
  onClick?: () => void;
  rightMeta?: React.ReactNode;
};

const SIZE_STYLES = {
  lg: {
    card: "w-72",
    pad: "p-5",
    avatar: "h-12 w-12",
    name: "text-base",
    sub: "text-sm",
    badge: "text-xs",
  },
  md: {
    card: "w-60",
    pad: "p-4",
    avatar: "h-10 w-10",
    name: "text-sm",
    sub: "text-xs",
    badge: "text-xs",
  },
  sm: {
    card: "w-48",
    pad: "p-3",
    avatar: "h-8 w-8",
    name: "text-xs",
    sub: "text-[11px]",
    badge: "text-[10px]",
  },
} as const;

export function PersonCard({
  node,
  size = "md",
  active,
  onClick,
  rightMeta,
}: Props) {
  const s = SIZE_STYLES[size];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "shadow-sm transition cursor-pointer select-none",
        // ✅ override any width coming from s.card
        "w-225 max-w-full",
        active ? "" : "hover:shadow-md",
      )}
    >
      <CardContent className={cn("flex items-center gap-3 ", s.pad)}>
        {/* avatar */}
        <div
          className={cn(
            "rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0",
            s.avatar,
          )}
        >
          {node.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <Avatars name={node.name} src={node.avatar} />
          ) : (
            <Avatars name={node.name} />
          )}
        </div>

        {/* text */}
        <div className="min-w-0 flex-1">
          <div className={cn("font-semibold truncate", s.name)}>
            {node.name}
          </div>

          {node.title && (
            <div className={cn("text-muted-foreground truncate", s.sub)}>
              {node.title}
            </div>
          )}

          {node.department && (
            <div className={cn("text-muted-foreground truncate", s.sub)}>
              {node.department}
            </div>
          )}
        </div>

        {/* meta */}
        <div className="flex flex-col items-end gap-1">
          {rightMeta}
          {node.hasChildren && (
            <Badge variant="outline" className={cn("leading-none", s.badge)}>
              +{node.childrenCount}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
