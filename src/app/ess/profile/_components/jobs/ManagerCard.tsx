"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/shared/ui/button";
import AssignMangerModal from "../AssignManagerModal";

export interface Manager {
  id: string;
  firstName: string;
  avatarUrl?: string;
  lastName: string;
  email: string;
}

interface ManagerCardProps {
  manager: Manager;
  employeeId?: string;
}

export function ManagerCard({ manager, employeeId }: ManagerCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="shadow-md bg-white rounded-lg p-6 border max-w-xl mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="capitalize font-semibold text-xl">Reporting Manager</h2>
        <Button className="mb-4" onClick={() => setIsOpen(true)}>
          Change Manager
        </Button>
      </div>
      <div className="flex items-center space-x-4">
        {manager.avatarUrl && (
          <Image
            src={manager.avatarUrl}
            alt={`${manager.firstName} ${manager.lastName}`}
            width={60}
            height={60}
            className="rounded-full object-cover"
          />
        )}
        <div>
          {manager.firstName && (
            <p className="text-md text-muted-foreground">
              {manager.firstName} {manager.lastName}
            </p>
          )}
          <p className="text-sm text-muted-foreground">{manager.email}</p>
        </div>
      </div>
      <AssignMangerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        employeeId={employeeId}
        managerId={manager.id}
      />
    </div>
  );
}
