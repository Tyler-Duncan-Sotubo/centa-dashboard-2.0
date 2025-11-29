import {
  CalendarClock,
  Users2,
  Wallet,
  Banknote,
  Settings as Gear,
} from "lucide-react";
import FrequencySettings from "../settings/pay-schedules/_components/FrequencySettings";
import PayGroupSettings from "../settings/pay-groups/_components/PayGroupSettings";
import AllowanceSettings from "../settings/_components/allowances/AllowanceSettings";
import { RemittanceSettings } from "../settings/_components/statutory-deductions/RemittanceSettings";
import CostCenterSettings from "../settings/cost-centers/_components/CostCenterSettings";
import OnboardingModule, { StepMetaItem } from "@/components/OnboardingModule";
import { JSX } from "react";

const payrollMeta: Record<string, StepMetaItem> = {
  pay_schedule: {
    label: "Set Pay Schedule",
    Icon: CalendarClock,
    Component: () => <FrequencySettings />,
  },
  pay_group: {
    label: "Create Pay Groups",
    Icon: Users2,
    Component: PayGroupSettings,
  },
  salary_structure: {
    label: "Configure Salary Structure",
    Icon: Wallet,
    Component: (p: JSX.IntrinsicAttributes & { size?: string }) => (
      <AllowanceSettings size="md:w-full" {...p} />
    ),
  },
  tax_details: {
    label: "Remittance Settings",
    Icon: Banknote,
    Component: (p: JSX.IntrinsicAttributes & { size?: string }) => (
      <RemittanceSettings size="md:w-full" {...p} />
    ),
  },
  cost_center: {
    label: "Setup Cost Centers",
    Icon: Gear,
    Component: CostCenterSettings,
  },
};

const payrollOrder = [
  "pay_schedule",
  "pay_group",
  "salary_structure",
  "tax_details",
  "cost_center",
] as const;

export default function PayrollOnboarding() {
  return (
    <OnboardingModule
      title="Payroll Onboarding"
      fetchUrl="payroll"
      order={payrollOrder}
      stepMeta={payrollMeta}
      // queryKey optional; default uses fetchUrl
    />
  );
}
