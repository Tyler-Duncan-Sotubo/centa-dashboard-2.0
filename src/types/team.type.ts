export type EmployeeGroup = {
  id: string;
  name: string;
  members: number;
  employeeIds: string[];
  slug?: string;
  type?: GroupType | undefined;
  parentGroupId?: string | null;
  location?: string;
  timezone?: string;
  headcountCap?: number;
  createdAt: string;
};

export enum GroupType {
  TEAM = "TEAM",
  PROJECT = "PROJECT",
  INTEREST = "INTEREST",
  SECURITY = "SECURITY",
}
export enum MemberRole {
  MEMBER = "member",
  LEAD = "lead",
  MANAGER = "manager",
  CONTRACTOR = "contractor",
}
