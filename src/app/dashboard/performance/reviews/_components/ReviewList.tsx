import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/ui/data-table";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Review } from "@/types/performance/review.type";
import { format } from "date-fns";
import { FaCheck } from "react-icons/fa";
import { Button } from "@/shared/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { Avatars } from "@/shared/ui/avatars";
import Link from "next/link";
import AssessmentModal from "./AssessmentModal";
import { FaEye } from "react-icons/fa6";

const ReviewList = ({
  filteredReviews,
}: {
  filteredReviews: Array<Review>;
}) => {
  const reviewColumns: ColumnDef<Review>[] = [
    {
      accessorKey: "employee",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Employee <ChevronsUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2">
            {Avatars({
              name: row.original.employee,
            })}
            <div className="flex flex-col">
              {row.original.score ? (
                <div className="capitalize font-semibold">
                  {row.original.employee}
                </div>
              ) : (
                <Link
                  href={`/dashboard/performance/reviews/employee/${row.original.id}`}
                  className="text-monzo-brandDark"
                >
                  <div className="capitalize font-semibold">
                    {row.original.employee}
                  </div>
                </Link>
              )}

              <div className="capitalize font-medium text-xs">
                {row.original.jobRoleName || "N/A"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "reviewer",
      header: "Reviewer",
      cell: ({ row }) => <p className="py-2">{row.original.reviewer}</p>,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.type}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className="text-xs capitalize text-muted-foreground">
          <StatusBadge status={row.original.status} />{" "}
        </span>
      ),
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) =>
        row.original.score !== null && row.original.score !== undefined
          ? `${row.original.score}%`
          : "0%",
    },
    {
      accessorKey: "progress",
      header: "Progress",
      cell: ({ row }) => {
        const value = row.original.progress;

        let color = "bg-muted-foreground";
        if (value < 40) color = "bg-red-500";
        else if (value < 80) color = "bg-yellow-500";
        else color = "bg-green-600";

        return (
          <div className="flex items-center gap-2 w-40">
            <div className="w-full h-3 rounded-full bg-muted relative overflow-hidden">
              <div
                className={`h-full ${color} transition-all duration-500`}
                style={{ width: `${value}%` }}
              />
            </div>

            {value === 100 ? (
              <span className="ml-1 text-green-600 text-sm">
                <FaCheck />
              </span>
            ) : (
              <span className="text-sm font-medium min-w-8">{value}%</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const review = row.original;
        const isComplete = review.progress === 100;
        return (
          <>
            {isComplete && <AssessmentModal assessmentId={review.id} />}

            {!isComplete && (
              <Link
                href={`/dashboard/performance/reviews/employee/${row.original.id}`}
                className="text-monzo-brandDark"
              >
                <Button
                  size="icon"
                  variant="link"
                  aria-label="Edit"
                  className="p-0"
                >
                  <FaEye className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={reviewColumns} data={filteredReviews} />
    </>
  );
};

export default ReviewList;
