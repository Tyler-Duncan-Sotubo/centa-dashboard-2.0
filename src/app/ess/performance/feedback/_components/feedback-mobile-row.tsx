"use client";

import * as React from "react";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import { Avatars } from "@/shared/ui/avatars";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { format } from "date-fns";
import { FaEye, FaTrash } from "react-icons/fa";
import type { Feedback } from "@/types/performance/feedback.type";
import { DeleteIconDialog } from "@/shared/ui/delete-icon-dialog";

type Props = DataTableMobileRowProps<Feedback> & {
  disabledAction?: boolean;
  onView?: (id: string) => void;
};

export function FeedbackMobileRow({
  row,
  onRowClick,
  disabledAction,
  onView,
}: Props) {
  const f = row.original;

  const typeLabel = (f.type ?? "").replaceAll("_", " ");
  const isSelf = f.type === "self";

  return (
    <div
      className={[
        "p-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(f)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {!isSelf && (
              <div className="shrink-0">
                {Avatars({ name: f.employeeName })}
              </div>
            )}

            <div className="min-w-0">
              <div className="font-semibold truncate">
                {isSelf ? "Your Feedback" : f.employeeName}
              </div>

              {!isSelf && (
                <div className="text-xs text-muted-foreground truncate">
                  {f.jobRoleName || "No Job Role"}
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="capitalize">
              {typeLabel}
            </Badge>
            <span>•</span>
            <span>{f.questionsCount ?? 0} question(s)</span>
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{f.senderName}</span>
            <span className="mx-1">•</span>
            <span>{format(new Date(f.createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-center gap-1">
          <Button
            size="sm"
            variant="link"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(f.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <FaEye className="mr-1" />
          </Button>

          {!disabledAction && isSelf ? (
            <div
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <DeleteIconDialog itemId={f.id} type="feedback" />
            </div>
          ) : (
            <Button
              variant="link"
              size="sm"
              disabled={disabledAction}
              className="cursor-help"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <FaTrash className="mr-1 text-monzo-error" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
