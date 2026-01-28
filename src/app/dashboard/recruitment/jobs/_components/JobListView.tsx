/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
} from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { formatDateHumanReadable } from "@/shared/utils/formatDateHumanReadable";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Badge } from "@/shared/ui/badge";
import Loading from "@/shared/ui/loading";
import { Avatars } from "@/shared/ui/avatars";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import Link from "next/link";
import { TemplateSelectionModal } from "../../offers/_components/TemplateSelectionModal";
import { ScheduleInterviewModal } from "../../interviews/_components/ScheduleInterviewModal";
import EmptyState from "@/shared/ui/empty-state";

type ResumeScore = {
  score: number;
  strengths: string[];
  weaknesses: string[];
};

type Application = {
  applicationId: string;
  fullName: string;
  email?: string;
  appSource?: string;
  appliedAt: string;
  resumeScore?: ResumeScore;
  stageName: string;
};

export default function JobListView({ jobId }: { jobId: string }) {
  const axiosInstance = useAxiosAuth();
  const [stages, setStages] = React.useState<any[]>([]);

  const { data, isLoading } = useQuery<Application[]>({
    queryKey: ["pipeline-table", jobId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/applications/list/${jobId}`);
      const rawStages = res.data.data;
      setStages(rawStages);

      return rawStages.flatMap((stage: any) =>
        stage.applications.map((app: any) => ({
          ...app,
          stageName: stage.stageName,
        })),
      );
    },
  });

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [showModal, setShowModal] = React.useState(false);
  const [showOfferTemplateModal, setShowOfferTemplateModal] =
    React.useState(false);
  const [selectedApplication, setSelectedApplication] =
    React.useState<Application | null>(null);
  const [selectedStage, setSelectedStage] = React.useState<string | null>(null);

  const movingApplication = useUpdateMutation({
    endpoint: "/api/applications/move-stage",
    successMessage: "Application moved successfully",
    refetchKey: "pipeline pipeline-table",
  });

  const columns: ColumnDef<Application>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name <ChevronsUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2">
            {Avatars({
              name: row.original.fullName,
            })}
            <div>
              <Link
                href={`/dashboard/recruitment/candidates/${row.original?.applicationId}`}
                className="capitalize cursor-pointer hover:underline text-brand"
              >
                {row.original.fullName}
              </Link>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "stageName",
      header: "Stage",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("stageName")}</Badge>
      ),
    },
    {
      accessorKey: "resumeScore.score",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Resume Score <ChevronsUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const score = row.original.resumeScore?.score ?? 0;
        return <span>{score}%</span>;
      },
    },
    {
      accessorKey: "appliedAt",
      header: "Applied",
      cell: ({ row }) =>
        formatDateHumanReadable(new Date(row.getValue("appliedAt"))),
    },
    {
      accessorKey: "stageName",
      header: "Next Stage",
      cell: ({ row }) => {
        const currentStage = row.original.stageName;

        return (
          <Select
            defaultValue={currentStage}
            onValueChange={(newStageName) => {
              const newStage = stages.find((s) => s.stageName === newStageName);
              if (!newStage) return;

              const toStageId = newStage.stageId;
              const toStageLabel = newStage.stageName.toLowerCase();

              setSelectedApplication(row.original);
              setSelectedStage(toStageId);

              if (toStageLabel.includes("interview")) {
                setShowModal(true);
                return;
              }

              if (toStageLabel.includes("offer")) {
                setShowOfferTemplateModal(true);
                return;
              }

              movingApplication({
                applicationId: row.original.applicationId,
                newStageId: toStageId,
              });
            }}
          >
            <SelectTrigger className="w-[140px] text-md">
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem
                  key={stage.stageId}
                  value={stage.stageName}
                  className="text-md"
                >
                  {stage.stageName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) return <Loading />;

  return (
    <div className="w-full">
      {data && data.length === 0 ? (
        <EmptyState
          title="No Candidates Found"
          description="There are no candidates in this stage yet."
          image={
            "https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585352/candidates-list_ddfz3x.svg"
          }
        />
      ) : (
        <>
          {" "}
          {stages.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {stages.map((stage) => (
                <div
                  key={stage.stageId}
                  className="px-4 py-1 rounded-md bg-muted text-md font-medium"
                >
                  {stage.stageName}{" "}
                  <span className="ml-1 text-muted-foreground">
                    ({stage.applications.length})
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center py-4 gap-4">
            <Input
              placeholder="Search email or name..."
              value={
                (table.getColumn("email")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("email")?.setFilterValue(event.target.value)
              }
              className="w-60"
            />
            {table.getSelectedRowModel().rows.length > 0 && (
              <Select
                onValueChange={(newStageName) => {
                  const newStage = stages.find(
                    (s) => s.stageName === newStageName,
                  );
                  if (!newStage) return;

                  const updates = table.getSelectedRowModel().rows.map((row) =>
                    movingApplication({
                      applicationId: row.original.applicationId,
                      newStageId: newStage.stageId,
                    }),
                  );

                  Promise.all(updates);
                }}
              >
                <SelectTrigger className="w-[250px] text-md">
                  <SelectValue placeholder="Change stage..." />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem
                      key={stage.stageId}
                      value={stage.stageName}
                      className="text-sm"
                    >
                      {stage.stageName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filter by stage..."
                value={
                  (table.getColumn("stageName")?.getFilterValue() as string) ??
                  ""
                }
                onChange={(event) =>
                  table
                    .getColumn("stageName")
                    ?.setFilterValue(event.target.value)
                }
                className="w-48"
              />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id}>
                    {group.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="text-md py-4 font-medium"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center h-24"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end items-center space-x-2 py-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
          {selectedApplication && selectedStage && (
            <ScheduleInterviewModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onSuccess={() => {
                movingApplication({
                  applicationId: selectedApplication.applicationId,
                  newStageId: selectedStage,
                });
                setShowModal(false);
              }}
              applicationId={selectedApplication.applicationId}
              candidateEmail={selectedApplication.email || ""}
              stage={
                (() => {
                  const label = selectedStage
                    ? stages
                        .find((s) => s.stageId === selectedStage)
                        ?.stageName.toLowerCase()
                    : "";
                  if (label?.includes("phone")) return "phone_screen";
                  if (label?.includes("tech")) return "tech";
                  if (label?.includes("onsite")) return "onsite";
                  return "final";
                })() as "phone_screen" | "tech" | "onsite" | "final"
              }
            />
          )}
          {selectedApplication && selectedStage && (
            <TemplateSelectionModal
              isOpen={showOfferTemplateModal}
              onClose={() => setShowOfferTemplateModal(false)}
              applicationId={selectedApplication.applicationId}
              newStageId={selectedStage}
            />
          )}
        </>
      )}
    </div>
  );
}
