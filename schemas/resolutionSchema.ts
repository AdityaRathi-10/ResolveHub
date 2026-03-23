import { z } from "zod";
import { RESOLUTION_STATUS } from "../app/generated/prisma/enums";

export const resolutionSchema = z
  .object({
    description: z.string().min(10).max(500).optional(),
    media: z.array(z.url()).optional(),
    status: z.enum(Object.values(RESOLUTION_STATUS)),
  })
  .refine(
    (data) => !!data.description || (data.media && data.media.length > 0),
    { error: "Either description or media must be provided" },
  );
