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

export interface AssetRequest {
  id: string;
  requestDate: string; // ISO date (e.g., "2025-06-19")
  assetType: string;
  purpose: string;
  urgency: "Normal" | "High" | "Critical";
  notes: string;
  status: "requested" | "approved" | "rejected" | "processing";
  createdAt: string; // ISO datetime
  updatedAt: string;
  employeeId: string;
  companyId: string;
  rejectionReason: string | null;
}
