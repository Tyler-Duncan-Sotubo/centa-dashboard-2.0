// data/sidebar.data.tsx
import { JSX } from "react";
import { FaGift, FaMoneyCheck } from "react-icons/fa";
import {
  MdDashboard,
  MdFeedback,
  MdLeaderboard,
  MdOutlineFlag,
  MdOutlineRateReview,
} from "react-icons/md";
import { MdAccessAlarms } from "react-icons/md";
import { FaClipboardUser, FaTags } from "react-icons/fa6";
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

// ESS menu (employee app)
export const essMain = [
  {
    title: "Home",
    icon: <MdDashboard size={25} />,
    link: "/ess",
    permissions: ["ess.login"],
  },
  {
    title: "Profile",
    icon: <FaClipboardUser size={20} />,
    link: "/ess/profile",
    permissions: ["ess.login", "employees.read_self"],
  },
  {
    title: "Performance",
    icon: <MdLeaderboard size={20} />,
    link: "/ess/performance/goals",
    permissions: ["ess.login", "performance.read"], // pick your self-service perm
    subItems: [
      {
        title: "Goals",
        icon: <MdOutlineFlag size={20} />,
        link: "/ess/performance/goals",
        permissions: ["ess.login", "performance.goals.read"],
      },
      {
        title: "Feedback",
        icon: <MdFeedback size={20} />,
        link: "/ess/performance/feedback",
        permissions: ["ess.login", "performance.reviews.submit_self"],
      },
      {
        title: "Appraisals",
        icon: <MdOutlineRateReview size={20} />,
        link: "/ess/performance/reviews",
        permissions: ["ess.login", "performance.reviews.read"],
      },
    ],
  },
  {
    title: "Timesheet",
    icon: <MdAccessAlarms size={20} />,
    link: "/ess/attendance",
    permissions: ["ess.login", "attendance.clockin"],
  },
  {
    title: "Leave",
    icon: <PiSneakerMoveFill size={20} />,
    link: "/ess/leave",
    permissions: ["ess.login", "leave.request.create"],
  },
  {
    title: "Salary Advance",
    icon: <FaMoneyCheck size={20} />,
    link: "/ess/loans",
    permissions: ["ess.login", "salary_advance.request"],
  },
  {
    title: "Reimbursements",
    icon: <LuHandCoins size={20} />,
    link: "/ess/reimbursements",
    permissions: ["ess.login", "expenses.read"], // or a more specific self perm
  },
  {
    title: "Assets",
    icon: <FaTags size={20} />,
    link: "/ess/assets",
    permissions: ["ess.login", "assets.request.read"],
  },
  {
    title: "Benefits",
    icon: <FaGift size={20} />,
    link: "/ess/benefits",
    permissions: ["ess.login", "benefits.read"],
  },
];
