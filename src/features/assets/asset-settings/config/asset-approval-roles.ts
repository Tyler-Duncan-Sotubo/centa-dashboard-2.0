import type { AssetSettingsRoleOption } from "../types/asset-settings.type";

export const approverRoles: AssetSettingsRoleOption[] = [
  { label: "Line Manager", value: "manager" },
  { label: "Finance Manager", value: "finance_manager" },
];

export const fallbackRoles: AssetSettingsRoleOption[] = [
  { label: "CEO", value: "super_admin" },
  { label: "HR Manager", value: "hr_manager" },
];
