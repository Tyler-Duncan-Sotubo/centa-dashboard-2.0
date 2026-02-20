import { z } from "zod";

export const locationAssignSchema = z.object({
  employeeId: z.string().uuid("Select a valid employee"),
  locationId: z.string().uuid("Select a valid location"),
});
