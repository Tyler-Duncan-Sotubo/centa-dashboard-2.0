import { z } from "zod";
import { CalendarIcon } from "lucide-react";
export type AllowedCols = 1 | 2 | 3 | 4 | 6 | 12;

export type FieldConfig = {
  name: string;
  label: string;
  required?: boolean;
  type: "text" | "date" | "boolean" | "textarea" | "enum";
  controlType?: "popoverCalendar" | "checkbox";
  icon?: React.ElementType;
  cols?: AllowedCols | undefined;
};

// each entry drives one form row
export const profileFields: FieldConfig[] = [
  {
    name: "dateOfBirth",
    label: "Date of Birth",
    required: true,
    type: "date",
    controlType: "popoverCalendar",
    icon: CalendarIcon,
    cols: 6 as AllowedCols,
  },
  {
    name: "gender",
    label: "Gender",
    required: true,
    type: "text",
    cols: 6 as AllowedCols,
  },
  {
    name: "maritalStatus",
    label: "Marital Status",
    type: "text",
    cols: 6 as AllowedCols,
  },
  { name: "address", label: "Address", type: "text", cols: 6 as AllowedCols },
  { name: "state", label: "State", type: "text", cols: 6 as AllowedCols },
  { name: "country", label: "Country", type: "text", cols: 6 as AllowedCols },
  {
    name: "phone",
    label: "Phone",
    required: true,
    type: "text",
    cols: 6 as AllowedCols,
  },
  {
    name: "emergencyName",
    label: "Emergency Contact Name",
    required: true,
    type: "text",
    cols: 6 as AllowedCols,
  },
  {
    name: "emergencyPhone",
    label: "Emergency Contact Phone",
    required: true,
    type: "text",
    cols: 6 as AllowedCols,
  },
  {
    name: "status",
    label: "Employment Status",
    required: true,
    type: "text",
    cols: 6 as AllowedCols,
  },
];

// src/schema/dependentFields.ts
export const dependentFields = [
  {
    name: "name",
    label: "Name",
    required: true,
    type: "text",
    cols: 6 as AllowedCols, // half width
  },
  {
    name: "relationship",
    label: "Relationship",
    required: true,
    type: "text",
    cols: 6 as AllowedCols, // half width
  },
  {
    name: "dateOfBirth",
    label: "Date of Birth",
    required: true,
    type: "date",
    controlType: "popoverCalendar",
    cols: 6 as AllowedCols, // half width
  },
  {
    name: "isBeneficiary",
    label: "Is Beneficiary",
    required: false,
    type: "boolean",
    controlType: "checkbox",
    cols: 6 as AllowedCols, // half width
  },
];

// src/schema/historyFields.ts
export const historyFields = [
  {
    name: "type",
    label: "Type",
    required: true,
    type: "enum",
    options: ["employment", "education"],
    cols: 6 as AllowedCols, // half width
  },
  {
    name: "title",
    label: "Title",
    required: true,
    type: "text",
    cols: 6 as AllowedCols, // half width
  },
  {
    name: "institution",
    label: "Institution/Company",
    type: "text",
    cols: 12 as AllowedCols, // full width
  },
  {
    name: "startDate",
    label: "Start Date",
    type: "date",
    controlType: "popoverCalendar",
    cols: 6 as AllowedCols, // half width
  },
  {
    name: "endDate",
    label: "End Date",
    type: "date",
    controlType: "popoverCalendar",
    cols: 6 as AllowedCols, // half width
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    cols: 12 as AllowedCols, // full width
  },
];

// src/schema/certificationFields.ts
export const certificationFields = [
  {
    name: "name",
    label: "Certification Name",
    required: true,
    type: "text",
    cols: 6 as AllowedCols, // half width
  },
  {
    name: "authority",
    label: "Issuing Authority",
    type: "text",
    cols: 6 as AllowedCols, // half width
  },
  {
    name: "licenseNumber",
    label: "License Number",
    type: "text",
    cols: 6 as AllowedCols, // half width
  },
  {
    name: "issueDate",
    label: "Issue Date",
    type: "date",
    controlType: "popoverCalendar",
    cols: 6 as AllowedCols, // half width
  },
  {
    name: "expiryDate",
    label: "Expiry Date",
    type: "date",
    required: false,
    controlType: "popoverCalendar",
    cols: 6 as AllowedCols, // half width
  },
  {
    name: "documentUrl",
    label: "Document URL",
    type: "text",
    cols: 12 as AllowedCols, // full width
  },
];

// Financial: Bank Information Fields
export const bankFields: FieldConfig[] = [
  {
    name: "bankName",
    label: "Bank Name",
    required: true,
    type: "text",
    cols: 6 as AllowedCols,
  },
  {
    name: "bankBranch",
    label: "Bank Branch",
    required: true,
    type: "text",
    cols: 6 as AllowedCols,
  },
  {
    name: "bankAccountNumber",
    label: "Account Number",
    required: true,
    type: "text",
    cols: 6 as AllowedCols,
  },
  {
    name: "bankAccountName",
    label: "Account Name",
    required: true,
    type: "text",
    cols: 6 as AllowedCols,
  },
  {
    name: "tin",
    label: "Tax Identification Number (TIN)",
    required: true,
    type: "text",
    cols: 6 as AllowedCols,
  },
  {
    name: "pensionPin",
    label: "Pension PIN",
    required: true,
    type: "text",
    cols: 6 as AllowedCols,
  },
  {
    name: "nhfNumber",
    label: "NHF #",
    required: true,
    type: "text",
    cols: 6 as AllowedCols,
  },
];

// Financial: Compensation Information Fields
export const compensationFields: FieldConfig[] = [
  {
    name: "startDate",
    label: "Effective Date",
    required: true,
    type: "date",
    controlType: "popoverCalendar",
    icon: CalendarIcon,
    cols: 6 as AllowedCols,
  },
  {
    name: "grossSalary",
    label: "Gross Salary",
    required: true,
    type: "text",
    cols: 6 as AllowedCols,
  },
  {
    name: "applyNhf",
    label: "NHF Applied",
    required: true,
    type: "boolean",
    controlType: "checkbox",
    cols: 6 as AllowedCols,
  },
];

export const profileSchema = z.object({
  dateOfBirth: z
    .string()
    .nonempty("Date of Birth is required")
    .refine((s) => !isNaN(Date.parse(s)), { message: "Invalid date" }),
  gender: z.string().nonempty("Gender is required"),
  maritalStatus: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().nonempty("Phone is required"),
  emergencyName: z.string().nonempty("Emergency Contact Name is required"),
  emergencyPhone: z.string().nonempty("Emergency Contact Phone is required"),
  status: z.string().nonempty("Employment Status is required"),
});

export type ProfileForm = z.infer<typeof profileSchema>;

export const dependentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  dateOfBirth: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), { message: "Invalid date" }),
  isBeneficiary: z.boolean().optional().default(false),
});

export type DependentForm = z.infer<typeof dependentSchema>;

export const historySchema = z.object({
  type: z.enum([
    "employment",
    "education",
    "certification",
    "promotion",
    "transfer",
    "termination",
  ]),
  title: z.string().min(1, "Title is required"),
  institution: z.string().optional(),
  startDate: z
    .string()
    .refine((s) => !s || !isNaN(Date.parse(s)), { message: "Invalid date" }),
  endDate: z
    .string()
    .refine((s) => !s || !isNaN(Date.parse(s)), { message: "Invalid date" }),
  description: z.string().optional(),
});

export type HistoryForm = z.infer<typeof historySchema>;

export const certificationSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
  authority: z.string().optional(),
  licenseNumber: z.string().optional(),
  issueDate: z
    .string()
    .refine((s) => !s || !isNaN(Date.parse(s)), { message: "Invalid date" }),
  expiryDate: z
    .string()
    .refine((s) => !s || !isNaN(Date.parse(s)), { message: "Invalid date" })
    .optional(),
  documentUrl: z.string().url("Must be a valid URL").optional(),
});

export type CertificationForm = z.infer<typeof certificationSchema>;

export const bankSchema = z.object({
  bankName: z.string().min(1, "Bank Name is required"),
  bankBranch: z.string().min(1, "Bank Branch is required"),
  bankAccountNumber: z.string().min(1, "Account Number is required"),
  bankAccountName: z.string().min(1, "Account Name is required"),
  tin: z.string().min(1, "TIN is required"),
  pensionPin: z.string().min(1, "Pension PIN is required"),
  nhfNumber: z.string().min(1, "NHF Number is required"),
});

export type BankForm = z.infer<typeof bankSchema>;

export const compensationSchema = z.object({
  startDate: z
    .string()
    .nonempty("Compensation Effective date is required")
    .refine((s) => !isNaN(Date.parse(s)), { message: "Invalid date" }),
  grossSalary: z.string().min(1, "Gross Salary is required"),
  applyNhf: z.boolean(),
});

export type CompensationForm = z.infer<typeof compensationSchema>;
