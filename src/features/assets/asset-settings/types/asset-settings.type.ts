export type AssetSettings = {
  multiLevelApproval: boolean;
  approverChain: string[];
  fallbackRoles?: string[];
};

export type AssetSettingsUpdateKey =
  | "multi_level_approval"
  | "approver_chain"
  | "approval_fallback";

export type AssetSettingsRoleOption = {
  label: string;
  value: string;
};
