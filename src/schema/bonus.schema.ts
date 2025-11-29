import { z } from "zod";

export const BonusSchema = z.object({
  amount: z.coerce.string({
    message: "Please enter a valid amount",
  }),
  bonusType: z.string({
    message: "Please enter a name",
  }),
  employeeId: z.string({
    message: "Please select an employee",
  }),
});

export type BonusType = z.infer<typeof BonusSchema>;
