import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(3, "Username should be atleast 3 characters"),
  email: z.email().endsWith("@iiitdmj.ac.in", "Invalid email"),
  password: z.string().min(8, "Password must be atleast 8 characters"),
});
