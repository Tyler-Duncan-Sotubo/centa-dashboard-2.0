"use client";

import { JSX, useState } from "react";
import { Button } from "@/shared/ui/button";
import PageHeader from "@/shared/ui/page-header";
import { FaCheckSquare, FaEdit, FaListAlt, FaTags } from "react-icons/fa";
import { DeleteIconDialog } from "@/shared/ui/delete-icon-dialog";
import { FaCirclePlus } from "react-icons/fa6";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/ui/data-table";
import OffboardingConfigModal from "./_components/OffboardingConfigModal";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import { isAxiosError } from "axios";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

type Item = {
  id: string;
  name: string;
  description?: string;
  isGlobal: boolean;
  companyId: string | null;
  isAssetReturnStep?: boolean;
};

const sidebarItems: {
  key: "types" | "reasons" | "checklist";
  label: string;
  icon: JSX.Element;
}[] = [
  {
    key: "checklist",
    label: "Termination Checklist",
    icon: <FaCheckSquare className="mr-2 " />,
  },
  {
    key: "types",
    label: "Termination Types",
    icon: <FaTags className="mr-2 " />,
  },
  {
    key: "reasons",
    label: "Termination Reasons",
    icon: <FaListAlt className="mr-2" />,
  },
];

export default function TerminationConfigPage() {
  const [activeTab, setActiveTab] = useState<"types" | "reasons" | "checklist">(
    "types",
  );
  const [modalOpen, setModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editData, setEditData] = useState<any | null>(null);

  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchOffboardingConfig = async () => {
    try {
      const res = await axiosInstance.get("/api/offboarding-config");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
      return [];
    }
  };

  type OffboardingConfig = {
    types: Item[];
    reasons: Item[];
    checklist: Item[];
  };

  const { data, isLoading, isError } = useQuery<OffboardingConfig>({
    queryKey: ["offboarding-config", activeTab],
    queryFn: fetchOffboardingConfig,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  const handleAddClick = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEditClick = (item: Item) => {
    setEditData(item);
    setModalOpen(true);
  };

  const renderList = () => {
    const list = data ? data[activeTab] : [];

    const baseColumns: ColumnDef<Item>[] = [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium text-md py-2.5">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.description || "-"}
          </div>
        ),
      },
    ];

    const checklistColumn: ColumnDef<Item> = {
      id: "assetReturn",
      header: "Asset Step",
      cell: ({ row }) =>
        row.original.isAssetReturnStep ? (
          <span className="text-xs text-orange-500 font-semibold">Yes</span>
        ) : (
          "-"
        ),
    };

    const metaColumns: ColumnDef<Item>[] = [
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="link"
                disabled={item.isGlobal}
                onClick={() => handleEditClick(item)}
              >
                <FaEdit />
              </Button>
              {!item.isGlobal && (
                <DeleteIconDialog itemId={item.id} type={activeTab} />
              )}
            </div>
          );
        },
      },
    ];

    // Combine columns conditionally
    const columns: ColumnDef<Item>[] =
      activeTab === "checklist"
        ? [...baseColumns, checklistColumn, ...metaColumns]
        : [...baseColumns, ...metaColumns];

    return <DataTable columns={columns} data={list} />;
  };

  return (
    <section className="px-5 py-4">
      <PageHeader
        title="Termination Configuration"
        description="Manage termination types, reasons, and checklist items for employee offboarding."
      />

      <div className="flex mt-8 gap-6">
        {/* Sidebar */}
        <div className="w-[28%] space-y-4 mt-16">
          <ul className="space-y-3">
            {sidebarItems.map((tab) => (
              <li key={tab.key}>
                <button
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full text-md text-left flex items-center p-4 rounded-md font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-monzo-background text-monzo-textPrimary"
                      : "hover:bg-white border text-black"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Panel */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold capitalize">{activeTab}</h2>
            <Button onClick={handleAddClick}>
              <FaCirclePlus className="mr-2" /> Add Item
            </Button>
          </div>
          {renderList()}
        </div>
      </div>
      <OffboardingConfigModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        activeTab={activeTab}
        data={editData}
        isEditing={!!editData}
      />
    </section>
  );
}
