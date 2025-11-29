export type Holiday = {
  id: string; // assuming each holiday has a unique identifier
  name: string;
  date: string; // ISO date string (e.g., "2025-07-04")
  year: string;
  type: string;

  country?: string;
  countryCode?: string;
  isWorkingDayOverride?: boolean;
  source?: "manual" | "api_import" | "system_default";

  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};
