"use server"

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { calculateDeadline } from "@/lib/calculateDeadline";
import { prisma } from "@/lib/prisma";
import { complaintSchema } from "@/schemas/complaintSchema";
import { getServerSession } from "next-auth";
import * as z from "zod"

export default async function createComplaintAction(data: z.infer<typeof complaintSchema>) {
    const { title, description, media, priority } = data
    const session = await getServerSession(authOptions)

    if(!title) {
        return { success: false, message: "Title is required" }
    }

    if(!session?.user) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        const createdAt = new Date()
        const deadline = calculateDeadline(priority!, createdAt)
    
        await prisma.complaint.create({
            data: {
                title,
                description,
                media,
                priority,
                deadline,
                user: {
                    connect: {
                        id: "cmn6durb20000vk3g7hbi2c0d"
                    }
                }
            }
        })

        return { success: true, message: "Complaint created successfully" };

    } catch (error) {
        console.log("Create Complaint Error:", error);
        return {
            success: false,
            message: "Something went wrong while creating complaint",
        };
    }
}