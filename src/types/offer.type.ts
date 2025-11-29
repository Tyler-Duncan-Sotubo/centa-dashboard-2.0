export interface CompanyLetterTemplate {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "published";
  companyId: string;
  createdAt: string;
  isSystemTemplate: boolean;
  content: string; // HTML content of the template
}

export interface SystemLetterTemplate {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  isDefault: boolean;
  isSystemTemplate: boolean;
  content: string; // HTML content of the template
}

export interface OfferTemplatesResponse {
  companyTemplates: CompanyLetterTemplate[];
  systemTemplates: SystemLetterTemplate[];
}

export interface OfferLetter {
  id: string;
  applicationId: string;
  templateId: string;
  status: "pending" | "sent" | "signed"; // extend as needed
  salary: string;
  startDate: string;
  candidateFullName: string;
  candidateEmail: string;
  jobTitle: string;
  letterUrl?: string;
  sentAt?: string; // ISO date string when the offer was sent
  signedLetterUrl?: string; // URL to the signed offer letter
}
