import type { JSX } from "react";
import {
  FileText,
  Banknote,
  CheckSquare,
  HeartPulse,
  Dumbbell,
  Gift,
} from "lucide-react";
import { FaTooth } from "react-icons/fa";

export const benefitDetails: Record<
  string,
  { icon: JSX.Element; description: string }
> = {
  Health: {
    icon: <HeartPulse className="w-6 h-6 text-red-500" />,
    description:
      "Medical coverage for doctor visits, prescriptions, and treatments.",
  },
  Dental: {
    icon: <FaTooth className="w-6 h-6 text-blue-500" />,
    description: "Coverage for dental exams, cleanings, and procedures.",
  },
  Wellness: {
    icon: <Dumbbell className="w-6 h-6 text-green-500" />,
    description: "Support for gym memberships, therapy, and healthy living.",
  },
  Perks: {
    icon: <Gift className="w-6 h-6 text-yellow-500" />,
    description:
      "Non-essential benefits like subscriptions, lunches, and gear.",
  },
  Other: {
    icon: <Gift className="w-6 h-6 text-muted-foreground" />,
    description: "General employee benefits and incentives.",
  },
};

export const benefitSteps = [
  { label: "Plan Details", icon: <FileText className="h-5 w-5" /> },
  { label: "Coverage", icon: <CheckSquare className="h-5 w-5" /> },
  { label: "Cost", icon: <Banknote className="h-5 w-5" /> },
];

export const coverageOptions = [
  "Employee Only",
  "Employee + Spouse",
  "Employee + Children",
  "Employee + Family",
];
