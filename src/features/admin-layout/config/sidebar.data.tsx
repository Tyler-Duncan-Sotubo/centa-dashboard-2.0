// data/sidebar.data.tsx
import React, { JSX } from "react";
import {
  FaUsers,
  FaGift,
  FaChartPie,
  FaFileAlt,
  FaBriefcase,
  FaBuilding,
  FaUserPlus,
  FaUsersCog,
  FaUserFriends,
  FaBullseye,
  FaClipboardCheck,
  FaCommentDots,
  FaTachometerAlt,
  FaUserCircle,
  FaBoxes,
  FaCalendarAlt,
  FaClock,
  FaEnvelopeOpen,
  FaFileInvoiceDollar,
  FaHandHoldingUsd,
  FaHeartbeat,
  FaMoneyBillWave,
  FaMoneyCheckAlt,
  FaReceipt,
  FaClipboardList,
  FaCogs,
  FaProjectDiagram,
  FaRegFileAlt,
  FaLightbulb,
  FaRegCalendarAlt,
  FaMoneyCheck,
} from "react-icons/fa";
import {
  MdCalendarToday,
  MdDashboard,
  MdEmail,
  MdExitToApp,
  MdFeedback,
  MdLeaderboard,
  MdOutlineAccessTime,
  MdOutlineFlag,
  MdOutlineRateReview,
  MdOutlineStarBorder,
  MdSettings,
  MdWorkOutline,
} from "react-icons/md";
import { MdAccessAlarms } from "react-icons/md";
import { HiOutlineBanknotes } from "react-icons/hi2";
import {
  FaBan,
  FaClipboardUser,
  FaFolder,
  FaLock,
  FaRegSquareCheck,
  FaSitemap,
  FaTags,
  FaUmbrellaBeach,
  FaUserTie,
} from "react-icons/fa6";
import { FiSettings } from "react-icons/fi";
import { TbLayoutGrid } from "react-icons/tb";
import { hasPermission } from "@/shared/utils/has-permission";
import { LuHandCoins } from "react-icons/lu";
import { PiSneakerMoveFill } from "react-icons/pi";

/** -----------------------------
 * Types
 * ------------------------------*/
export type Permission = string;

type BaseItem = {
  title: string;
  name?: string;
  link?: string;
  icon?: JSX.Element;
  permissions?: readonly Permission[];
  subItems?: readonly MenuItem[];
};

type DividerItem = {
  title: string;
  name?: string;
  type: "divider";

  // Add the optional keys as undefined so the union has the same shape
  link?: undefined;
  icon?: undefined;
  permissions?: undefined;
  subItems?: undefined;
};

export type MenuItem = BaseItem | DividerItem;
/** Type guards */
// types assumed:
// export type MenuItem = BaseItem | DividerItem;
// Divider has: { type: "divider"; subItems?: undefined; permissions?: undefined; ... }

const isDivider = (i: MenuItem): i is Extract<MenuItem, { type: "divider" }> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (i as any).type === "divider";

// Overloads preserve the union type of your input
export function withBasePerm(
  menu: readonly MenuItem[],
  basePerm: string,
): MenuItem[];
export function withBasePerm<M extends MenuItem>(
  menu: readonly M[],
  basePerm: string,
): M[];

// Impl
export function withBasePerm(menu: readonly MenuItem[], basePerm: string) {
  return menu.map((item) => {
    if (isDivider(item)) {
      // leave dividers untouched so their shape stays valid
      return item;
    }

    const permissions = Array.from(
      new Set([...(item.permissions ?? []), basePerm]),
    );
    const subItems = item.subItems
      ? // recurse; input is readonly, return a mutable copy (ok for rendering)
        withBasePerm(item.subItems, basePerm)
      : undefined;

    // preserve the original branch of the union via spread + cast
    return { ...item, permissions, subItems } as typeof item;
  });
}

/** -----------------------------
 * Filtering
 * ------------------------------*/

/**
 * Recursively filters a menu tree by permissions (ALL-of).
 * - Removes parents the user can't access.
 * - Cleans up leading/trailing/consecutive dividers.
 * - Hides parents with no link and no visible children.
 */
export function filterMenu(
  menu: readonly MenuItem[],
  userPermissions: readonly string[],
): MenuItem[] {
  const filtered = menu
    .map<MenuItem | null>((item) => {
      // Dividers pass through; they'll be cleaned later.
      if (isDivider(item)) return item;

      // Check parent permission
      const parentAllowed = hasPermission(userPermissions, item.permissions);
      if (!parentAllowed) return null;

      // Recurse into sub-items (if any)
      const visibleSubs: MenuItem[] | undefined = item.subItems
        ? filterMenu(item.subItems, userPermissions)
        : undefined;

      // If parent has no link and ends up with no visible, non-divider children, drop it
      if (!item.link) {
        const hasClickableChild = (visibleSubs ?? []).some(
          (s) => !isDivider(s),
        );
        if (!hasClickableChild) return null;
      }

      return { ...item, subItems: visibleSubs } as MenuItem;
    })
    .filter((x): x is MenuItem => x !== null);

  // Clean up dividers: remove leading/trailing and collapse consecutive
  const cleaned: MenuItem[] = [];
  let lastWasDivider = true; // start true to remove a leading divider
  for (const it of filtered) {
    if (isDivider(it)) {
      if (!lastWasDivider) {
        cleaned.push(it);
        lastWasDivider = true;
      }
    } else {
      cleaned.push(it);
      lastWasDivider = false;
    }
  }
  if (cleaned.at(-1) && isDivider(cleaned.at(-1)!)) {
    cleaned.pop();
  }

  return cleaned;
}

/** -----------------------------
 * Menu data
 * (Dashboard-gated: require "dashboard.login" + feature perms)
 * ------------------------------*/
export const main: readonly MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard size={20} />,
    link: "/dashboard",
    permissions: ["dashboard.login"],
  },
  {
    title: "Hiring",
    icon: <FaUserTie size={20} />,
    link: "/dashboard/recruitment/jobs",
    permissions: ["dashboard.login", "jobs.manage"],
    subItems: [
      {
        title: "Setup Checklist",
        link: "/dashboard/recruitment/checklist",
        icon: <FaRegSquareCheck size={18} />,
        permissions: ["dashboard.login", "jobs.manage"],
      },
      {
        title: "Jobs",
        link: "/dashboard/recruitment/jobs",
        icon: <FaBriefcase size={18} />,
        permissions: ["dashboard.login", "jobs.manage"],
      },
      {
        title: "Calendar",
        link: "/dashboard/recruitment/interviews",
        icon: <MdCalendarToday size={18} />,
        permissions: ["dashboard.login", "jobs.manage"],
      },
      {
        title: "Talent Pool",
        link: "/dashboard/recruitment/candidates",
        icon: <FaUserFriends size={18} />,
        permissions: ["dashboard.login", "jobs.manage"],
      },
      {
        title: "Offers",
        link: "/dashboard/recruitment/offers",
        icon: <MdWorkOutline size={18} />,
        permissions: ["dashboard.login", "jobs.manage"],
      },
      {
        title: "Divider",
        name: "settings",
        type: "divider",
      },
      {
        title: "Pipeline",
        link: "/dashboard/recruitment/pipelines",
        icon: <FaProjectDiagram size={18} />,
        permissions: ["dashboard.login", "jobs.manage"],
      },
      {
        title: "Scorecards",
        link: "/dashboard/recruitment/scorecards",
        icon: <FaClipboardCheck size={18} />,
        permissions: ["dashboard.login", "jobs.manage"],
      },
      {
        title: "Email Templates",
        link: "/dashboard/recruitment/email-templates",
        icon: <MdEmail size={18} />,
        permissions: ["dashboard.login", "jobs.manage"],
      },
      {
        title: "Offer Templates",
        link: "/dashboard/recruitment/offer-templates",
        icon: <MdWorkOutline size={18} />,
        permissions: ["dashboard.login", "jobs.manage"],
      },
    ],
  },

  {
    title: "Staff",
    icon: <FaUsers size={20} />,
    link: "/dashboard/employees",
    permissions: ["dashboard.login", "employees.manage"],
    subItems: [
      {
        title: "Setup Checklist",
        link: "/dashboard/employees/checklist",
        icon: <FaRegSquareCheck size={18} />,
        permissions: ["dashboard.login", "employees.manage"],
      },
      {
        title: "Onboarding",
        link: "/dashboard/employees/onboarding",
        icon: <FaUserPlus size={18} />,
        permissions: ["dashboard.login", "employees.manage"],
      },
      {
        title: "Employees",
        link: "/dashboard/employees",
        icon: <FaUsers size={18} />,
        permissions: ["dashboard.login", "employees.manage"],
      },
      {
        title: "Teams",
        link: "/dashboard/employees/groups",
        icon: <FaUsersCog size={18} />,
        permissions: ["dashboard.login", "employees.manage"],
      },
      {
        title: "Offboarding",
        link: "/dashboard/employees/offboarding",
        icon: <MdExitToApp size={18} />,
        permissions: ["dashboard.login", "employees.manage"],
      },
      {
        title: "Divider",
        name: "company",
        type: "divider",
      },
      {
        title: "Offices",
        link: "/dashboard/company/offices",
        icon: <FaBuilding size={18} />,
        permissions: ["dashboard.login", "employees.manage"],
      },
      {
        title: "Departments",
        link: "/dashboard/company/departments",
        icon: <FaSitemap size={18} />,
        permissions: ["dashboard.login", "employees.manage"],
      },
      {
        title: "Job Roles",
        link: "/dashboard/company/job-roles",
        icon: <FaBriefcase size={18} />,
        permissions: ["dashboard.login", "employees.manage"],
      },
      {
        title: "Org Chart",
        link: "/dashboard/company/org-chart",
        icon: <FaProjectDiagram size={18} />,
        permissions: ["dashboard.login", "employees.manage"],
      },
      {
        title: "Divider",
        name: "settings",
        type: "divider",
      },
      {
        title: "Onboarding Templates",
        link: "/dashboard/employees/onboarding-templates",
        icon: <MdWorkOutline size={18} />,
        permissions: ["dashboard.login", "employees.manage"],
      },
      {
        title: "Offboarding Process",
        link: "/dashboard/employees/offboarding-process",
        icon: <MdExitToApp size={18} />,
        permissions: ["dashboard.login", "employees.manage"],
      },
    ],
  },
  {
    title: "Performance",
    icon: <MdLeaderboard size={20} />,
    link: "/dashboard/performance",
    permissions: ["dashboard.login", "performance.reviews.read"],
    subItems: [
      {
        title: "Setup Checklist",
        link: "/dashboard/performance/checklist",
        icon: <FaRegSquareCheck size={18} />,
        permissions: ["dashboard.login", "performance.reviews.read"],
      },
      {
        title: "Overview",
        link: "/dashboard/performance",
        icon: <FaTachometerAlt size={18} />,
        permissions: ["dashboard.login", "performance.reviews.read"],
      },
      {
        title: "Appraisals",
        link: "/dashboard/performance/reviews",
        icon: <FaCommentDots size={18} />,
        permissions: ["dashboard.login", "performance.reviews.read_team"],
      },
      {
        title: "Goals",
        link: "/dashboard/performance/goals",
        icon: <FaBullseye size={18} />,
        permissions: ["dashboard.login", "performance.reviews.manage_all"],
      },
      {
        title: "360° Feedback",
        link: "/dashboard/performance/feedback",
        icon: <FaUserCircle size={18} />,
        permissions: ["dashboard.login", "performance.reviews.read"],
      },
      {
        title: "Divider",
        name: "settings",
        type: "divider",
      },
      {
        title: "General Settings",
        link: "/dashboard/performance/settings",
        icon: <FiSettings size={18} />,
        permissions: ["dashboard.login", "performance.reviews.manage_all"],
      },
      {
        title: "Goal Policies",
        link: "/dashboard/performance/settings/goals-policy",
        icon: <MdOutlineStarBorder size={18} />,
        permissions: ["dashboard.login", "performance.reviews.manage_all"],
      },
      {
        title: "Feedback Settings",
        link: "/dashboard/performance/settings/feedback",
        icon: <MdFeedback size={18} />,
        permissions: ["dashboard.login", "performance.reviews.manage_all"],
      },
      {
        title: "Templates",
        link: "/dashboard/performance/settings/templates",
        icon: <FaRegFileAlt size={18} />,
        permissions: ["dashboard.login", "performance.reviews.manage_all"],
      },
      {
        title: "Divider",
        name: "Reports",
        type: "divider",
      },
      {
        title: "Reports",
        icon: <FaChartPie size={20} />,
        link: "/dashboard/performance/reports",
        permissions: ["dashboard.login", "performance.reviews.read"],
      },
    ],
  },

  {
    title: "Attendance",
    icon: <MdAccessAlarms size={20} />,
    link: "/dashboard/attendance",
    permissions: ["dashboard.login", "attendance.manage"],
    subItems: [
      {
        title: "Setup Checklist",
        link: "/dashboard/attendance/checklist",
        icon: <FaRegSquareCheck size={18} />,
        permissions: ["dashboard.login", "attendance.manage"],
      },
      {
        title: "TimeSheet",
        link: "/dashboard/attendance",
        icon: <FaClock size={18} />,
        permissions: ["dashboard.login", "attendance.manage"],
      },
      {
        title: "Rotas & Shifts",
        link: "/dashboard/attendance/rota-shifts",
        icon: <FaCalendarAlt size={18} />,
        permissions: ["dashboard.login", "attendance.manage"],
      },
      {
        title: "Divider",
        name: "settings",
        type: "divider",
      },
      {
        title: "Attendance Settings",
        link: "/dashboard/attendance/settings",
        icon: <MdOutlineAccessTime size={18} />,
        permissions: ["dashboard.login", "attendance.settings"],
      },
      {
        title: "Shift Management",
        link: "/dashboard/attendance/settings/shift-management",
        icon: <FaCalendarAlt size={18} />,
        permissions: ["dashboard.login", "attendance.settings"],
      },
      {
        title: "Divider",
        name: "Reports",
        type: "divider",
      },
      {
        title: "Attendance Summary",
        icon: <MdOutlineAccessTime size={20} />,
        link: "/dashboard/attendance/reports/attendance-summary",
        permissions: ["dashboard.login", "attendance.settings"],
      },
      {
        title: "Shift Reports",
        icon: <FaCalendarAlt size={20} />,
        link: "/dashboard/attendance/reports/shift-reports",
        permissions: ["dashboard.login", "attendance.settings"],
      },
      {
        title: "Department Summary",
        icon: <FaSitemap size={20} />,
        link: "/dashboard/attendance/reports/department-summary",
        permissions: ["dashboard.login", "attendance.settings"],
      },
    ],
  },

  {
    title: "Leave",
    icon: <FaCalendarAlt size={20} />,
    link: "/dashboard/leave",
    permissions: ["dashboard.login", "leave.request.read_all"],
    subItems: [
      {
        title: "Setup Checklist",
        link: "/dashboard/leave/checklist",
        icon: <FaRegSquareCheck size={18} />,
        permissions: ["dashboard.login", "leave.request.read_all"],
      },
      {
        title: "Leave Management",
        link: "/dashboard/leave",
        icon: <FaEnvelopeOpen size={18} />,
        permissions: ["dashboard.login", "leave.reports"],
      },
      {
        title: "Calendar",
        link: "/dashboard/leave/calendar",
        icon: <MdCalendarToday size={18} />,
        permissions: ["dashboard.login", "leave.reports"],
      },
      {
        title: "Divider",
        name: "settings",
        type: "divider",
      },
      {
        title: "Leave Settings",
        link: "/dashboard/leave/settings",
        icon: <FaCogs size={18} />,
        permissions: [
          "dashboard.login",
          "leave.types.manage",
          "leave.policy.manage",
        ],
      },
      {
        title: "Leave Types & Policies",
        link: "/dashboard/leave/settings/types-policies",
        icon: <FaClipboardList size={18} />,
        permissions: [
          "dashboard.login",
          "leave.types.manage",
          "leave.policy.manage",
        ],
      },
      {
        title: "Blocked Days",
        link: "/dashboard/leave/settings/blocked-days",
        icon: <FaBan size={18} />,
        permissions: ["dashboard.login", "leave.blocked_days.manage"],
      },
      {
        title: "Reserved Days",
        link: "/dashboard/leave/settings/reserved-days",
        icon: <FaLock size={18} />,
        permissions: ["dashboard.login", "reserved_days.manage"],
      },
      {
        title: "Holidays",
        link: "/dashboard/leave/settings/holidays",
        icon: <FaUmbrellaBeach size={18} />,
        permissions: [
          "dashboard.login",
          "leave.types.manage",
          "leave.policy.manage",
        ],
      },
      {
        title: "Divider",
        name: "Reports",
        type: "divider",
      },
      {
        title: "Leave Utilization",
        link: "/dashboard/leave/reports/leave-utilization",
        icon: <FaChartPie size={18} />,
        permissions: [
          "dashboard.login",
          "leave.types.manage",
          "leave.policy.manage",
        ],
      },
      {
        title: "Leave Balance",
        link: "/dashboard/leave/reports/leave-balance",
        icon: <FaClipboardCheck size={18} />,
        permissions: [
          "dashboard.login",
          "leave.types.manage",
          "leave.policy.manage",
        ],
      },
    ],
  },

  {
    title: "Payroll",
    icon: <HiOutlineBanknotes size={20} />,
    link: "/dashboard/payroll/overview",
    permissions: ["dashboard.login", "payroll.run.calculate"],
    subItems: [
      {
        title: "Setup Checklist",
        link: "/dashboard/payroll/checklist",
        icon: <FaRegSquareCheck size={18} />,
        permissions: ["dashboard.login", "payroll.run.calculate"],
      },
      {
        title: "Overview",
        link: "/dashboard/payroll/overview",
        icon: <FaReceipt size={18} />,
        permissions: ["dashboard.login", "payroll.run.calculate"],
      },
      {
        title: "Run Payroll",
        link: "/dashboard/payroll",
        icon: <FaMoneyCheckAlt size={18} />,
        permissions: ["dashboard.login", "payroll.run.calculate"],
      },
      // {
      //   title: "Off-Cycle Payments",
      //   link: "/dashboard/payroll/off-cycle",
      //   icon: <FaMoneyBillWave size={18} />,
      //   permissions: ["dashboard.login", "payroll.run.calculate"],
      // },
      {
        title: "Salary Advance",
        link: "/dashboard/payroll/salary-advance",
        icon: <FaHandHoldingUsd size={18} />,
        permissions: ["dashboard.login", "payroll.run.calculate"],
      },
      {
        title: "Remittances",
        link: "/dashboard/payroll/taxes",
        icon: <FaFileInvoiceDollar size={18} />,
        permissions: ["dashboard.login", "payroll.run.calculate"],
      },
      // {
      //   title: "Documents & Forms",
      //   link: "/dashboard/payroll/documents-forms",
      //   icon: <FaFileAlt size={18} />,
      //   permissions: ["dashboard.login", "payroll.run.calculate"],
      // },
      {
        title: "Divider",
        name: "settings",
        type: "divider",
      },
      {
        title: "General Settings",
        link: "/dashboard/payroll/settings",
        icon: <MdSettings size={18} />,
        permissions: ["dashboard.login", "payroll.run.calculate"],
      },
      {
        title: "Pay Schedules",
        link: "/dashboard/payroll/settings/pay-schedules",
        icon: <FaRegCalendarAlt size={18} />,
        permissions: ["dashboard.login", "payroll.run.calculate"],
      },
      {
        title: "Pay Group",
        link: "/dashboard/payroll/settings/pay-groups",
        icon: <FaUsersCog size={18} />,
        permissions: ["dashboard.login", "payroll.run.calculate"],
      },
      {
        title: "Pay Adjustments",
        link: "/dashboard/payroll/settings/adjustments",
        icon: <FaMoneyCheckAlt size={18} />,
        permissions: ["dashboard.login", "payroll.run.calculate"],
      },
      {
        title: "Cost Centers",
        link: "/dashboard/payroll/settings/cost-centers",
        icon: <FaBuilding size={18} />,
        permissions: ["dashboard.login", "payroll.run.calculate"],
      },
      {
        title: "Divider",
        name: "Reports",
        type: "divider",
      },
      {
        title: "Reports",
        icon: <FaChartPie size={20} />,
        link: "/dashboard/payroll/reports",
        permissions: ["dashboard.login", "payroll.run.calculate"],
      },
    ],
  },

  {
    title: "Expenses",
    link: "/dashboard/expenses",
    icon: <FaReceipt size={18} />,
    permissions: ["dashboard.login", "expenses.manage"],
  },

  {
    title: "Assets",
    icon: <FaTags size={20} />,
    link: "/dashboard/assets",
    permissions: ["dashboard.login", "assets.manage"],
    subItems: [
      {
        title: "Assets Management",
        link: "/dashboard/assets",
        icon: <FaBoxes size={18} />,
        permissions: ["dashboard.login", "assets.manage"],
      },
      {
        title: "Requests",
        link: "/dashboard/assets/requests",
        icon: <FaEnvelopeOpen size={18} />,
        permissions: ["dashboard.login", "assets.manage"],
      },
      {
        title: "Health",
        link: "/dashboard/assets/reports",
        icon: <FaHeartbeat size={18} />,
        permissions: ["dashboard.login", "assets.manage"],
      },
      {
        title: "Divider",
        name: "settings",
        type: "divider",
      },
      {
        title: "Settings",
        link: "/dashboard/assets/settings",
        icon: <MdSettings size={18} />,
        permissions: ["dashboard.login", "assets.manage"],
      },
    ],
  },

  {
    title: "Benefits",
    icon: <FaGift size={20} />,
    link: "/dashboard/benefits",
    permissions: ["dashboard.login", "benefit_plans.manage"],
  },
  {
    title: "Documents",
    icon: <FaFolder size={20} />,
    link: "/dashboard/documents",
    permissions: ["dashboard.login", "payroll.reports.read"],
  },
] as const;
