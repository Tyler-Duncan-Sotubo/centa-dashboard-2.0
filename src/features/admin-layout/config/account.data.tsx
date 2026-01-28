import { User, Users, Building2 } from "lucide-react";

export const accountItems = [
  {
    label: "Profile",
    icon: <User size={25} />,
    link: "/dashboard/settings/profile",
  },
  {
    label: "Users",
    icon: <Users size={25} />,
    link: "/dashboard/settings/access-control",
  },
  {
    label: "Company",
    icon: <Building2 size={25} />, // Building icon for departments
    link: "/dashboard/settings/organization",
  },
];
