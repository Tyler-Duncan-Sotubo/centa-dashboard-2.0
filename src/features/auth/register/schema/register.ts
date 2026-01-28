import { z } from "zod";

export enum Role {
  SUPER_ADMIN = "super_admin",
  HR_MANAGER = "hr_manager",
  PAYROLL_SPECIALIST = "payroll_specialist",
  FINANCE_OFFICER = "finance_officer",
  EMPLOYEE = "employee",
  MANAGER = "manager",
  ADMIN = "admin",
  RECRUITER = "recruiter",
}

export const RegisterSchema = z
  .object({
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    passwordConfirmation: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    companyName: z.string().nonempty({}),
    country: z.string().nonempty({}),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    role: z.nativeEnum(Role, {
      errorMap: () => ({ message: "Role is required" }),
    }),
    terms: z.literal(true, {
      errorMap: () => ({
        message: "You must accept the terms and conditions.",
      }),
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords must match.",
    path: ["passwordConfirmation"],
  });
