"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Trash, PlusCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/shared/ui/alert-dialog";
import { useDeleteMutation } from "@/shared/hooks/useDeleteMutation";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { FaEdit, FaFileImport } from "react-icons/fa";
import PageHeader from "@/shared/ui/page-header";
import BulkUploadModal from "@/shared/ui/bulk-upload-modal";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { CostCenterModal } from "./CostCenterModal";

export interface CostCenter {
  code: string;
  name: string;
  budget: number;
  id: string;
}

const CostCenterSettings = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [isCostCenterOpen, setIsCostCenterOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] =
    useState<CostCenter | null>(null);

  const fetchCostCenters = async () => {
    try {
      const res = await axiosInstance.get("/api/cost-centers");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cost-centers"],
    queryFn: fetchCostCenters,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  const Alert = ({
    icon,
    type,
    id,
  }: {
    icon: React.ReactNode;
    type: string;
    id: string;
  }) => {
    const deleteBonus = useDeleteMutation({
      endpoint: `/api/cost-centers/${id}`,
      successMessage: "Cost Centers deleted successfully",
      refetchKey: "cost-centers onboarding payroll",
    });

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost">{icon}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {type === "edit" ? "Edit Cost Centers" : "Cost Centers"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {type} this bonus?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="text-white w-1/4 bg-red-600 hover:bg-red-600"
              onClick={() => deleteBonus()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  if (status === "loading" || isLoading) return <Loading />;
  if (isError)
    return <div className="text-red-500">Failed to load bonuses</div>;

  return (
    <section className="px-4">
      <PageHeader
        title="Cost Centers"
        description="Manage your cost centers here."
      >
        <div className="space-x-2">
          <Button className="w-32" onClick={() => setIsCostCenterOpen(true)}>
            <PlusCircle size={16} /> Add
          </Button>
          <Button className="w-32" onClick={() => setIsImportOpen(true)}>
            <FaFileImport size={16} /> import
          </Button>
        </div>
      </PageHeader>

      <div>
        {/* ✅ Table always visible */}
        <div className="my-2 space-y-4 py-6">
          <Table className="text-md">
            <TableHeader className="shadow-2xs rounded-lg border">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead className="text-right pr-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length > 0 ? (
                data.map((bonus: CostCenter) => (
                  <TableRow key={bonus.id}>
                    <TableCell>{bonus.name}</TableCell>
                    <TableCell className="py-4">{bonus.code}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(bonus.budget)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={"ghost"}
                        size={"sm"}
                        onClick={() => {
                          setIsCostCenterOpen(true);
                          setIsEditing(true);
                          setSelectedCostCenter(bonus);
                        }}
                      >
                        <FaEdit size={20} className="text-brand" />
                      </Button>
                      <Alert
                        icon={<Trash className="text-red-500" />}
                        type="bonus"
                        id={bonus.id}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                /* Show empty state row */
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No bonuses added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {isCostCenterOpen && (
        <CostCenterModal
          isOpen={isCostCenterOpen}
          onClose={() => setIsCostCenterOpen(false)}
          isEditing={isEditing}
          selected={selectedCostCenter}
        />
      )}

      {isImportOpen && (
        <BulkUploadModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          title="Bulk Upload Shifts"
          endpoint="/api/cost-centers/bulk"
          refetchKey="cost-centers"
          successMessage="Cost centers added successfully!"
          exampleDownloadHref="https://res.cloudinary.com/dw1ltt9iz/raw/upload/v1757585684/cost_centers_rtyrjk.xlsx"
          exampleDownloadLabel=""
        />
      )}
    </section>
  );
};

export default CostCenterSettings;
