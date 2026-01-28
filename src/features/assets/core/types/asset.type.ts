export type Asset = {
  id: string;
  // Specification
  name: string;
  modelName?: string;
  color?: string;
  specs?: string;
  category: string;
  manufacturer?: string;
  serialNumber: string;
  notes?: string;
  documentUrl?: string;
  employeeId?: string;

  hasReport: boolean;

  // Value
  purchasePrice: string;
  purchaseDate: string;
  usefulLifeYears: number;
  depreciationMethod?: "StraightLine" | "DecliningBalance";
  warrantyExpiry?: string;

  internalId?: string;

  // Assignment
  assignedTo?: string;
  assignedEmail?: string;
  location: string;
  lendDate?: string;
  returnDate?: string;
  status: "available" | "assigned" | "maintenance" | "retired" | "lost";
};
