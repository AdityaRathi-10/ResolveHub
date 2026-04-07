"use server"

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { calculateCaretakerPoints } from "@/lib/calculateCaretakerPoints";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function submitResolutionAction(
  caretakerId: string,
  complaintId: string,
  description: string,
  mediaUrls: string[],
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  if (session.user.role !== "CARETAKER") {
    throw new Error("Only caretakers can post resolutions for complaints");
  }

  if (session.user.id !== caretakerId) {
    throw new Error("You are not allow to perform this action");
  }

  const resolutionsCount = await prisma.resolution.count({
    where: {
      complaintId
    }
  })

  if(resolutionsCount > 0) {
    const lastResolution = await prisma.resolution.findFirst({
      where: {
        complaintId
      },
    });

    if(lastResolution?.status === "PENDING") {
      await prisma.resolution.update({
        where: {
          id: lastResolution.id
        },
        data: {
          status: "DISCARDED"
        }
      })
    }
  }
  
  const resolutionCreated = await prisma.resolution.create({
    data: {
      caretakerId,
      complaintId,
      description,
      media: mediaUrls,
    },
  });

  if (resolutionCreated.id) {
    await prisma.complaintAudit.create({
      data: {
        complaintId,
        actorId: caretakerId,
        type: "RESOLUTION_SUBMITTED",
        message: "Resolution shared",
      },
    });
  }

  return {
    success: true,
    message: "Resolution added successfully",
  };
}

export async function approveResolution(
  complaintId: string,
  studentId: string,
  caretakerId: string | null,
  resolutionId: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  if (session.user.role !== "STUDENT") {
    throw new Error("Only student can approve resolutions");
  }

  const updatedResolution = await prisma.resolution.update({
    where: {
      id: resolutionId,
    },
    data: {
      status: "APPROVED",
    },
  });

  if (!updatedResolution) {
    return {
      success: false,
      message: "Error updating resolution status",
    };
  }

  const updatedComplaint = await prisma.complaint.update({
    where: {
      id: complaintId,
    },
    data: {
      status: "RESOLVED",
    },
  });

  if (!updatedComplaint) {
    return {
      success: false,
      message: "Error updating complaint status",
    };
  }

  const caretakerPoints = calculateCaretakerPoints(
    updatedComplaint.deadline!,
    updatedComplaint.createdAt,
  );

  if (!caretakerId) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  await prisma.user.update({
    where: {
      id: caretakerId,
    },
    data: {
      points: caretakerPoints,
    },
  });

  await prisma.complaintAudit.create({
    data: {
      actorId: studentId,
      complaintId,
      type: "STATUS_CHANGED",
      message: "Resolution approved",
    },
  });

  revalidatePath(`/complaints/${complaintId}`);

  return {
    success: true,
    message: "Resolution approved",
  };
}

export async function disapproveResolution(
  complaintId: string,
  studentId: string,
  resolutionId: string,
  reason: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  if (session.user.role !== "STUDENT") {
    throw new Error("Only student can disapprove resolutions");
  }

  const updatedResolution = await prisma.resolution.update({
    where: {
      id: resolutionId,
    },
    data: {
      status: "REJECTED",
      rejectionReason: reason,
      rejectedAt: new Date(),
    },
  });

  if (!updatedResolution) {
    return {
      success: false,
      message: "Error updating resolution status",
    };
  }

  await prisma.complaintAudit.create({
    data: {
      actorId: studentId,
      complaintId,
      type: "STATUS_CHANGED",
      message: "Resolution rejected",
    },
  });

  revalidatePath(`/complaints/${complaintId}`);

  return {
    success: true,
    message: "Resolution rejected",
  };
}