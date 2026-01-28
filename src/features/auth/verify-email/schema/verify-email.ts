import { z } from "zod";

export const verifyEmailSchema = z.object({
  token: z.string().length(6, "OTP must be exactly 6 digits"),
});

export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;
