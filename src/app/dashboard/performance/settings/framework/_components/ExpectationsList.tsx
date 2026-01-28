"use client";

import { useMemo, useState } from "react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { FaEdit, FaSearch } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/ui/data-table";
import { Expectation } from "@/types/performance/framework.type";
import RoleCompetencyModal from "./RoleCompetencyModal";
import { DeleteIconDialog } from "@/shared/ui/delete-icon-dialog";
import CompetencyModal from "../../competency/_components/CompetencyModal";

interface ExpectationsListProps {
  roleTitle: string;
  roleId: string;
  expectations: Expectation[];
}

export default function ExpectationsList({
  roleTitle,
  roleId,
  expectations,
}: ExpectationsListProps) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Expectation | null>(null);
  const [open, setOpen] = useState(false);
  const [competencyOpen, setCompetencyOpen] = useState(false);

  const filtered = useMemo(() => {
    return expectations.filter((e) =>
      e.competencyName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [expectations, search]);

  const columns: ColumnDef<Expectation>[] = [
    {
      accessorKey: "competencyName",
      header: "Competency",
    },
    {
      accessorKey: "levelName",
      header: "Expected Level",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="link"
            onClick={() => setEditing(row.original)}
          >
            <FaEdit />
          </Button>
          <DeleteIconDialog itemId={row.original.id} type="expectation" />
        </div>
      ),
    },
  ];

  return (
    <div className="col-span-2 space-y-4">
      <h3 className="font-semibold text-lg">Expectations for {roleTitle}</h3>
      <div className="flex justify-between items-center">
        <div>
          <Input
            placeholder="Search competencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<FaSearch />}
            className="w-[300px]"
          />
        </div>
        <div className="space-x-3">
          <Button onClick={() => setCompetencyOpen(true)}>
            <FaCirclePlus className="mr-2" />
            Create Competency
          </Button>
          <Button onClick={() => setOpen(true)}>
            <FaCirclePlus className="mr-2" />
            Add Expectation
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} />
      <CompetencyModal open={competencyOpen} setOpen={setCompetencyOpen} />
      <RoleCompetencyModal open={open} setOpen={setOpen} roleId={roleId} />
      {editing && (
        <RoleCompetencyModal
          open={!!editing}
          setOpen={() => setEditing(null)}
          roleId={roleId}
          initialData={editing}
        />
      )}
    </div>
  );
}
