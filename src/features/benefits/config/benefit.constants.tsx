import type { JSX } from "react";
import {
  HeartPulse,
  Dumbbell,
  Gift,
  Activity,
  PiggyBank,
  Bus,
} from "lucide-react";
import { FaTooth, FaWheelchair } from "react-icons/fa";
import { benefitCategories } from "../types/benefit.type";
import { FaHeart } from "react-icons/fa6";

export const benefitTypes = [
  "Health",
  "Dental",
  "Wellness",
  "Perks",
  "Life Insurance",
  "Disability Insurance",
  "Retirement Plans",
  "Commuter Benefits",
] as const;

export const categoryIcons: Record<string, () => JSX.Element> = {
  Health: () => <HeartPulse className="w-6 h-6 text-red-500" />,
  Dental: () => <FaTooth className="w-6 h-6 text-blue-500" />,
  Wellness: () => <Dumbbell className="w-6 h-6 text-green-500" />,
  Perks: () => <Gift className="w-6 h-6 text-yellow-500" />,
};

export const categoryMeta: Record<
  benefitCategories[number],
  { icon: React.ReactNode; description: string }
> = {
  Health: {
    icon: <HeartPulse className="h-8 w-8 text-red-500" />,
    description:
      "Comprehensive medical, hospital and prescription coverage for you and your family.",
  },
  Dental: {
    icon: <FaTooth className="h-8 w-8 text-amber-500" />,
    description:
      "Routine check-ups, cleanings, and orthodontics—keeping every smile healthy.",
  },
  Wellness: {
    icon: <Activity className="h-8 w-8 text-sky-500" />,
    description:
      "Gym memberships, mental-health resources and lifestyle coaching to boost wellbeing.",
  },
  Perks: {
    icon: <Gift className="h-8 w-8 text-pink-500" />,
    description:
      "Employee discounts, gift cards and fun extras that recognise and reward great work.",
  },
  "Life Insurance": {
    icon: <FaHeart className="h-8 w-8 text-rose-600" />,
    description:
      "Term life cover that provides financial security for your loved ones if the unexpected happens.",
  },
  "Disability Insurance": {
    icon: <FaWheelchair className="h-8 w-8 text-purple-600" />,
    description:
      "Short- and long-term disability benefits that replace income when illness or injury keeps you from working.",
  },
  "Retirement Plans": {
    icon: <PiggyBank className="h-8 w-8 text-yellow-600" />,
    description:
      "Company-sponsored 401(k) and pension options—often with employer matching—to help you save for the future.",
  },
  "Commuter Benefits": {
    icon: <Bus className="h-8 w-8 text-indigo-600" />,
    description:
      "Tax-advantaged transit passes and parking reimbursements to make your daily commute more affordable.",
  },
};
