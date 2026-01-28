"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/data-table";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Avatars } from "@/shared/ui/avatars";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/ui/select";
import { OfferLetter } from "@/types/offer.type";
import Link from "next/link";
import { FaEdit, FaFilePdf } from "react-icons/fa";
import SendOfferButton from "./SendOfferButton";

function getColumns(data: OfferLetter[] | undefined): ColumnDef<OfferLetter>[] {
  const baseColumns: ColumnDef<OfferLetter>[] = [
    {
      accessorKey: "candidateFullName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Candidate Name <ChevronsUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {Avatars({ name: row.original.candidateFullName })}
          <div className="capitalize font-semibold">
            {row.original.candidateFullName}
          </div>
        </div>
      ),
    },
    { accessorKey: "candidateEmail", header: "Email" },
    { accessorKey: "jobTitle", header: "Job Title" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as OfferLetter["status"];
        const variant =
          status === "signed"
            ? "completed"
            : status === "sent"
              ? "ongoing"
              : "pending";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "salary",
      header: "Salary",
      cell: ({ row }) => {
        const value = row.getValue("salary") as string;
        return `₦${Number(value).toLocaleString()}`;
      },
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => {
        const date = row.getValue("startDate") as string;
        return <span>{format(new Date(date), "PPP")}</span>;
      },
    },
    {
      id: "letterUrl",
      header: "Offer Letter",
      cell: ({ row }) => {
        const url = row.original.letterUrl;
        const signedUrl = row.original.signedLetterUrl;

        return (
          <div className="flex justify-center gap-4">
            {url ? (
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline"
                title="View Original Offer Letter"
              >
                <FaFilePdf size={20} />
                <span className="text-xs hidden sm:inline">Original</span>
              </Link>
            ) : (
              <span className="text-muted-foreground italic text-sm">
                Not generated
              </span>
            )}

            {signedUrl && (
              <Link
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-green-600 hover:underline"
                title="View Signed Offer Letter"
              >
                <FaFilePdf size={20} />
                <span className="text-xs hidden sm:inline">Signed</span>
              </Link>
            )}
          </div>
        );
      },
    },
  ];

  const showSend = data?.some(
    (item) => item.status === "pending" || item.status === "sent",
  );
  const showActions = data?.some(
    (item) => item.status === "signed" || item.status === "pending",
  );

  if (showActions) {
    baseColumns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const offerId = row.original.id;
        const isSigned = row.original.status === "signed";

        return (
          <div className="flex text-center">
            <Link
              href={`/dashboard/recruitment/offers/edit?offerId=${offerId}`}
            >
              <Button variant="link" className="p-1">
                <FaEdit size={20} />
              </Button>
            </Link>
            {isSigned && (
              <Link
                href={`/dashboard/recruitment/offers/view?offerId=${offerId}`}
                className="ml-4 text-blue-600 hover:underline"
              >
                View Signed Offer
              </Link>
            )}
          </div>
        );
      },
    });
  }

  if (showSend) {
    baseColumns.push({
      id: "send",
      header: "Send",
      cell: ({ row }) => {
        const offer = row.original;
        const canSend = offer.status === "pending";
        const isSent = offer.status === "sent";

        return canSend ? (
          <SendOfferButton
            offerId={offer.id}
            candidateEmail={offer.candidateEmail}
          />
        ) : isSent ? (
          <Badge variant="outline">Offer Sent</Badge>
        ) : (
          <Badge variant="pending">Not Sent</Badge>
        );
      },
    });
  }

  return baseColumns;
}

export default function OfferLettersTable({
  data,
}: {
  data: OfferLetter[] | undefined;
}) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredData = data?.filter((item) =>
    statusFilter === "all" ? true : item.status === statusFilter,
  );

  const columns = getColumns(filteredData);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-end">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="signed">Signed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable columns={columns} data={filteredData ?? []} />
      </div>
    </div>
  );
}
