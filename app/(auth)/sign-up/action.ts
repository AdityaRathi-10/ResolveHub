"use server"

import * as z from "zod"
import { signUpSchema } from "@/schemas/signUpSchema"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function signUpAction(data: z.infer<typeof signUpSchema>) {
    const { name, email, password } = data

    if(!name.length || name.length < 3) {
        return { success: false, message: "Invalid username" };
    }

    if(!email.endsWith("@iiitdmj.ac.in")) {
        return { success: false, message: "Invalid email address" };
    }

    if(!password || password.length < 8) {
        return { success: false, message: "Password must be at least 8 characters" };
    }
    

    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if(user) {
        return { success: false, message: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    })
    return { success: true, message: "User created successfully" };
}