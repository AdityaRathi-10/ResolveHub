"use server";

import * as z from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { complaintSchema } from "@/schemas/complaintSchema";
import { calculateDeadline } from "@/lib/calculateDeadline";

export async function editComplaintAction(
  complaintId: string,
  data: z.infer<typeof complaintSchema>,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const { title, description, media, priority } = data;

  if (!title) {
    return { success: false, message: "Title is required" };
  }

  const existingComplaint = await prisma.complaint.findUnique({
    where: { 
        id: complaintId 
    },
    select: {
        createdAt: true
    }
  });

  if (!existingComplaint) {
    return { success: false, message: "Complaint not found" };
  }

  const newDeadline = calculateDeadline(
    priority ?? "LOW",
    existingComplaint.createdAt,
  );

  const updatedComplaint = await prisma.complaint.update({
    where: {
      id: complaintId,
    },
    data: {
      title,
      description,
      media,
      priority,
      isEdited: true,
      deadline: newDeadline,
    },
  });

  if(!updatedComplaint) {
    return {
        success: false,
        message: "Error updating complaint"
    }
  }

  return {
    success: true,
    message: "Complaint updated successfully"
  }
}
