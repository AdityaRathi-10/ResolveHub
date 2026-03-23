import { z } from "zod";

export const commentSchema = z.object({
  description: z.string().max(500),
});
