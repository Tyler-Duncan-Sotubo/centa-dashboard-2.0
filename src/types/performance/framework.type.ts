// types/performance/framework.type.ts

export interface Expectation {
  id: string;
  roleId: string;
  competencyId: string;
  expectedLevelId: string;

  // Resolved/display names
  competencyName: string;
  levelName: string;
}
