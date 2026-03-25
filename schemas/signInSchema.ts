import { z } from "zod";

export const signInSchema = z.object({
  email: z.email().endsWith("@iiitdmj.ac.in", "Invalid email"),
  password: z.string().min(8, "Password must be atleast 8 characters"),
});
