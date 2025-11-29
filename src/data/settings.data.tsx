import {
  FaUsersCog,
  FaLock,
  FaClipboardCheck,
  FaBuilding,
  FaUser,
  FaRegMoneyBillAlt,
} from "react-icons/fa";

export const settingsItems = [
  {
    category: "Company Settings",
    title: "Personal Information",
    description:
      "Manage your personal details, including name, email, and contact information.",
    link: "/dashboard/settings/profile",
    icon: <FaUser size={20} />,
  },
  {
    category: "Company Settings",
    title: "Business",
    description:
      "Manage your company's legal name, business type, and branding settings.",
    link: "/dashboard/settings/organization",
    icon: <FaBuilding size={20} />,
  },
  {
    category: "Expenses Settings",
    title: "Expense Configuration",
    description:
      "Configure settings related to employee expenses, including approval workflows and reimbursement policies.",
    link: "/dashboard/settings/expense-configuration",
    icon: <FaRegMoneyBillAlt size={20} />, // Using a money icon for expenses
  },
  {
    category: "Security Settings",
    title: "Team and security",
    description:
      "Manage user roles, permissions, and access levels across the HRIS system. Ensure that sensitive data is protected and only accessible to authorized personnel. 2FA settings can also be configured here.",
    link: "/dashboard/settings/access-control",
    icon: <FaUsersCog size={20} />,
  },
  {
    category: "Security Settings",
    title: "Audit Logs",
    description:
      "Track and review all user actions, configuration changes, and security-related events across the system.",
    link: "/dashboard/settings/audit-logs",
    icon: <FaClipboardCheck size={20} />,
  },
  {
    category: "Security Settings",
    title: "Permissions",
    description:
      "Manage user permissions, roles, and access levels to ensure that sensitive data is protected and only accessible to authorized personnel.",
    link: "/dashboard/settings/permissions",
    icon: <FaLock size={20} />,
  },
];
