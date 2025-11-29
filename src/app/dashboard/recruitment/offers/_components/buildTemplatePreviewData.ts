/* eslint-disable @typescript-eslint/no-explicit-any */

const DEFAULT_MOCKS: Record<string, any> = {
  companyLogoUrl: "https://dummyimage.com/120x60/cccccc/000.png&text=Logo",
  companyName: "Acme Corp",
  companyAddress: "123 Business Rd, Lagos",
  companyEmail: "hr@acme.com",
  companyPhone: "+234 700 123 4567",

  todayDate: "20 June 2025",
  candidateFirstName: "Sarah",
  candidateFullName: "Deji Adeyemi Johnson",
  jobTitle: "Software Engineer",
  salaryNumeric: "6,000,000",
  salaryWords: "six million naira",
  startDate: "1 July 2025",
  workLocation: "Lagos",
  teamName: "Platform",
  managerName: "John Doe",
  managerTitle: "Engineering Manager",
  offerExpiryDate: "28 June 2025",

  hrName: "Jane HR",
  hrTitle: "People-Ops Manager",
  hrJobTitle: "People-Ops Manager",

  payDay: "25th",
  paymentMethod: "Bank Transfer",
  probationPeriod: "3 months",
  revisionAfter: "12 months",
  insuranceCoverage: "1,000,000",
  responseDueDate: "28 June 2025",
  contactPerson: "Jane HR",
  contactEmail: "jane.hr@acme.com",

  sig_cand: "_________",
  date_cand: "_________",
  sig_emp: "_________",
  date_emp: "_________",

  salary: {
    basic: "3,000,000",
    hra: "1,000,000",
    allowances: "1,000,000",
    pension: "1,000,000",
    total: "6,000,000",
  },

  jobSummary: "Develop and maintain backend services.",
  baseSalary: "6,000,000",
  payFrequency: "monthly",
  bonusDetails: "Performance bonus up to 10% annually",
  benefitsSummary: "Health, pension, 21 days annual leave",
};

export function buildTemplatePreviewData(
  template: string
): Record<string, any> {
  const regex = /{{\s*([\w.]+)\s*}}/g;
  const matches = Array.from(template.matchAll(regex)).map((m) => m[1]);
  const uniqueKeys = Array.from(new Set(matches)); // remove duplicates

  const data: Record<string, any> = {};

  for (const key of uniqueKeys) {
    const parts = key.split(".");

    if (parts.length === 1) {
      const val = DEFAULT_MOCKS[key];
      data[key] = val ?? `{{${key}}}`;
    } else {
      const [root, nested] = parts;
      if (!data[root]) data[root] = {};
      data[root][nested] = DEFAULT_MOCKS[root]?.[nested] ?? `{{${key}}}`;
    }
  }

  return data;
}
