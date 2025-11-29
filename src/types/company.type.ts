export enum PayFrequency {
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
}

export type Company = {
  id: string;
  name: string;
  country: string;
  logo_url?: string;
  domain: string;
  isActive: boolean;
  currency: "NGN" | "USD" | "EUR" | "GBP";
  regNo: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  subscriptionPlan: "free" | "pro" | "enterprise";
};
