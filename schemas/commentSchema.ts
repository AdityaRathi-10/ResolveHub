import { z } from "zod";

export const complaintSchema = z.object({
  description: z.string().max(500),
});
