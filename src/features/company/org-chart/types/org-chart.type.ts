export type OrgChartNodeDto = {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar?: string | null;
  isDepartmentHead?: boolean;
  managerId: string | null;

  hasChildren: boolean;
  childrenCount: number;

  children: OrgChartNodeDto[];
};
