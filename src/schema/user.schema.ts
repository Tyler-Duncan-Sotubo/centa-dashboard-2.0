import { z } from "zod";

export const userSchema = z.object({
  name: z.string({ message: "Name is Required" }).min(1),
  email: z.string({ message: "Email is Required" }).email({
    message: "Invalid Email Address",
  }),
  role: z.string({ message: "Role is Required" }).min(1),
});

export type UserSchemaType = z.infer<typeof userSchema>;

// Validation Schema
export const ProfileSchema = z.object({
  avatar: z.string().optional(),
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email").min(5, "Email is required"),
});

export type ProfileSchemaType = z.infer<typeof ProfileSchema>;
