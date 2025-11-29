import {
  FaUserPlus,
  FaUsers,
  FaRegMoneyBillAlt,
  FaPlusCircle,
} from "react-icons/fa";

export const quickActions = [
  {
    label: "Invite Employee",
    icon: <FaUserPlus size={25} />,
    link: "/dashboard/employees/invite",
  },
  {
    label: "Import Employees",
    icon: <FaUsers size={25} />,
    link: "/dashboard/employees",
  },
  {
    label: "Run Payroll",
    icon: <FaRegMoneyBillAlt size={25} />,
    link: "/dashboard/payroll",
  },
  {
    label: "Add Paygroup",
    icon: <FaPlusCircle size={25} />,
    link: "/dashboard/payroll/settings",
  },
];
