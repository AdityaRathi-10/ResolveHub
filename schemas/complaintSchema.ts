import { z } from "zod";
import { PRIORITY } from "../app/generated/prisma/enums";

export const complaintSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(10).max(500).optional(),
  media: z.array(z.url()).optional(),
  priority: z.enum(Object.values(PRIORITY)).optional(),
});
