"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IoIosChatboxes } from "react-icons/io";

type FeedbackType =
  | "self"
  | "peer"
  | "manager_to_employee"
  | "employee_to_manager";

type FeedbackRule = {
  type: FeedbackType;
  enabled: boolean;
};

type FeedbackSettings = {
  rules: {
    employee?: FeedbackRule[];
    manager?: FeedbackRule[];
  };
};

type Props = {
  onSelect: (type: FeedbackType) => void;
  settings: FeedbackSettings;
  userRole: string;
};

const LABELS: Record<FeedbackType, string> = {
  self: "Self",
  peer: "Peer",
  manager_to_employee: "Manager to Employee",
  employee_to_manager: "Employee to Manager",
};

export default function FeedbackTypeDropdown({
  onSelect,
  settings,
  userRole,
}: Props) {
  const isPrivileged = ["super_admin", "hr", "admin"].includes(userRole);
  const simplifiedRole: "employee" | "manager" = [
    "manager",
    "team_lead",
  ].includes(userRole)
    ? "manager"
    : "employee";

  // Define allowed types based on role
  const allowedTypes: FeedbackType[] =
    simplifiedRole === "manager"
      ? ["self", "peer", "employee_to_manager", "manager_to_employee"]
      : ["self", "peer", "employee_to_manager"];

  const enabledTypes: FeedbackType[] = isPrivileged
    ? ["self", "peer", "manager_to_employee", "employee_to_manager"]
    : (settings?.rules?.[simplifiedRole] || [])
        .filter((rule) => rule.enabled && allowedTypes.includes(rule.type))
        .map((rule) => rule.type);

  if (enabledTypes.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center">
          <IoIosChatboxes className="mr-2 w-4 h-4" />
          Add Feedback
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {enabledTypes.map((type) => (
          <DropdownMenuItem
            key={type}
            onClick={() => {
              // Add animation frame to prevent freeze issues
              requestAnimationFrame(() => onSelect(type));
            }}
          >
            {LABELS[type]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
