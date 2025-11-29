// components/performance/RoleList.tsx
"use client";

import { Button } from "@/components/ui/button";
import React from "react";

type Role = {
  id: string;
  title: string;
};

interface RoleListProps {
  roles: Role[];
  activeRoleId: string;
  onSelect: (roleId: string) => void;
}

export default function RoleList({
  roles,
  activeRoleId,
  onSelect,
}: RoleListProps) {
  return (
    <div className="">
      <h3 className="font-semibold text-lg mb-4">Job Roles</h3>
      <ul className="space-y-2">
        {roles.map((role) => (
          <li key={role.id}>
            <Button
              onClick={() => onSelect(role.id)}
              className={`w-full text-left px-3 py-2 rounded text-black ${
                activeRoleId === role.id
                  ? "bg-monzo-brandDark text-white"
                  : "hover:bg-monzo-brandDark/80 bg-white text-black border border-gray-300"
              }`}
            >
              {role.title}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
