"use client";

import { Row } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";

import { useDeleteMutation } from "@/shared/hooks/useDeleteMutation";
import { Button } from "@/shared/ui/button";
import GroupModal from "@/app/dashboard/payroll/settings/pay-groups/_components/GroupModal";
import DepartmentModal from "@/features/company/departments/ui/DepartmentModal";
import JobRoleModal from "@/features/company/job-roles/ui/JobRoleModal";
import EditRequestModal from "@/features/leave/leave-management/ui/EditRequestModal";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  basePath: string;
  getId: (data: TData) => string | undefined;
  getName?: (data: TData) => string;
  getDescription?: (data: TData) => string;
  getLevel?: (data: TData) => string;
}

const DataTableRowActions = <TData,>({
  row,
  basePath,
  getId,
  getName,
  getDescription,
  getLevel,
}: DataTableRowActionsProps<TData>) => {
  const router = useRouter();

  // Get the ID of the row
  const id = getId(row.original);
  const name = getName ? getName(row.original) : "";
  const description = getDescription ? getDescription(row.original) : "";
  const level = getLevel ? getLevel(row.original) : "";

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = React.useState(false);
  const [isLeaveRequestOpen, setIsLeaveRequestOpen] = React.useState(false);
  const [isJobRoleOpen, setIsJobRoleOpen] = React.useState(false);

  const deleteDepartment = useDeleteMutation({
    endpoint: `/api/department/${id}`,
    refetchKey: "departments",
  });

  const deleteGroup = useDeleteMutation({
    endpoint: `/api/pay-groups/${id}`,
    refetchKey: "pay-group",
  });

  const deleteJobRole = useDeleteMutation({
    endpoint: `/api/job-roles/${id}`,
    refetchKey: "job-roles",
  });

  const deleteLeaveType = useDeleteMutation({
    endpoint: `/api/leave-types/${id}`,
    refetchKey: "leave-types",
  });

  const deleteLeavePolicy = useDeleteMutation({
    endpoint: `/api/leave-policy/${id}`,
    refetchKey: "leave-policies",
  });

  const deleteItem = async () => {
    setIsDeleting(true);
    if (basePath === "departments") {
      await deleteDepartment();
    } else if (basePath === "groups") {
      await deleteGroup();
    } else if (basePath === "job-roles") {
      await deleteJobRole();
    } else if (basePath === "leave-types") {
      await deleteLeaveType();
    } else if (basePath === "leave-policies") {
      await deleteLeavePolicy();
    }
    setIsDeleting(false);
  };

  const viewItem = () => {
    if (basePath === "employees") {
      router.push(`/dashboard/${basePath}/${id}`);
    } else if (basePath === "departments") {
      setIsDepartmentOpen(true);
    } else if (basePath === "leave-requests") {
      setIsLeaveRequestOpen(true);
    } else if (basePath === "job-roles") {
      setIsJobRoleOpen(true);
    }
  };

  return (
    <div className="flex justify-center space-x-2">
      <div className="cursor-pointer flex justify-center items-center">
        {basePath === "leave-policies" ||
        basePath === "leave-types" ||
        basePath === "groups" ? (
          ""
        ) : (
          <Button variant="ghost" size="icon" onClick={() => viewItem()}>
            <Edit size={24} />
          </Button>
        )}
      </div>

      {/* Department Modal */}
      {isDepartmentOpen && (
        <DepartmentModal
          isOpen={isDepartmentOpen}
          onClose={() => setIsDepartmentOpen(false)}
          id={id}
          isEditing={true}
          name={name}
        />
      )}

      {/* Job Roles */}
      {isJobRoleOpen && (
        <JobRoleModal
          isOpen={isJobRoleOpen}
          onClose={() => setIsJobRoleOpen(false)}
          id={id}
          isEditing={true}
          name={name}
          description={description}
          level={level}
        />
      )}

      {/* Group Modal */}
      {basePath === "groups" && (
        <GroupModal id={id} isEditing={true} name={name} />
      )}

      {/* Leave Request Modal */}
      {isLeaveRequestOpen && (
        <EditRequestModal
          isOpen={isLeaveRequestOpen}
          onClose={() => setIsLeaveRequestOpen(false)}
          id={id}
        />
      )}

      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div className="cursor-pointer flex justify-center items-center">
            {basePath === "leave-requests" || basePath === "employees" ? (
              ""
            ) : (
              <Button variant="ghost" size="icon">
                <Trash2 size={16} color="red" />
              </Button>
            )}
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem()}
              disabled={isDeleting}
              className="text-white bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DataTableRowActions;
