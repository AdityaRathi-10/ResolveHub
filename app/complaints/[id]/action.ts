"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache";

export async function toggleUpvote(complaintId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;

  const existing = await prisma.upvotes.findUnique({
    where: {
      userId_complaintId: {
        userId,
        complaintId,
      },
    },
  });

  if (existing) {
    await prisma.upvotes.delete({
      where: {
        userId_complaintId: {
          userId,
          complaintId,
        },
      },
    });

    await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        upvotesCount: { decrement: 1 },
      },
    });

    return { hasUpvoted: false };
  } else {
    await prisma.upvotes.create({
      data: {
        userId,
        complaintId,
      },
    });

    await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        upvotesCount: { increment: 1 },
      },
    });

    return { hasUpvoted: true };
  }
}

export async function assignComplaint(complaintId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;
  const username = session.user.name;

  if (session.user.role !== "CARETAKER") {
    throw new Error("Only caretakers can assign complaints");
  }

  const updated = await prisma.complaint.updateMany({
    where: {
      id: complaintId,
      assignedToId: null,
    },
    data: {
      assignedToId: userId,
    },
  });

  if (updated.count === 0) {
    return {
      success: false,
      message: "Already assigned",
    };
  }

  await prisma.complaintAudit.create({
    data: {
      complaintId,
      actorId: userId,
      type: "ASSIGNED",
      message: `Assigned to ${username}`
    }
  })

  return {
    success: true,
    message: "Complaint assigned successfully",
  };
}

export async function unassignComplaint(complaintId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;
  const username = session.user.name;

  if (session.user.role !== "CARETAKER") {
    throw new Error("Only caretakers can unassign complaints");
  }

  const updated = await prisma.complaint.updateMany({
    where: {
      id: complaintId,
      assignedToId: userId,
    },
    data: {
      assignedToId: null,
    },
  });

  if (updated.count === 0) {
    return {
      success: false,
      message: "Already unassigned",
    };
  }

  await prisma.complaintAudit.create({
    data: {
      complaintId,
      actorId: userId,
      type: "UNASSIGNED",
      message: `Unassigned ${username}`
    }
  })

  return {
    success: true,
    message: "Complaint unassigned successfully",
  };
}

export async function startWorkingOnComplaint(complaintId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;

  if (session.user.role !== "CARETAKER") {
    throw new Error("Only caretakers can start working on complaints");
  }

  const updated = await prisma.complaint.update({
    where: {
      id: complaintId
    },
    data: {
      status: "IN_PROGRESS"
    }
  })

  if(!updated) {
    return {
      success: false,
      message: "Error updating status"
    }
  }

  await prisma.complaintAudit.create({
    data: {
      complaintId,
      actorId: userId,
      type: "STATUS_CHANGED",
      message: `Complaint is now ${updated.status.replaceAll("_", " ")} state`
    }
  })

  revalidatePath(`/complaints/${complaintId}`)

  return {
    success: true,
    message: "Complaint is now in progress"
  }
}

export async function submitResolutionAction(caretakerId: string, complaintId: string, description: string, mediaUrls: string[]) {
  const session = await getServerSession(authOptions)
  if(!session?.user) throw new Error("Unauthorized")

  if (session.user.role !== "CARETAKER") {
    throw new Error("Only caretakers can post resolutions for complaints");
  }

  if(session.user.id !== caretakerId) {
    throw new Error("You are not allow to perform this action")
  }

  const resolutionCreated = await prisma.resolution.create({
    data: {
      caretakerId,
      complaintId,
      description,
      media: mediaUrls,
    }
  })

  if(resolutionCreated.id) {
    await prisma.complaintAudit.create({
      data: {
        complaintId,
        actorId: caretakerId,
        type: "RESOLUTION_SUBMITTED",
        message: "Resolution shared"
      }
    })
  }

  revalidatePath(`/complaints/${complaintId}`)

  return {
    success: true,
    message: "Resolution added successfully"
  }
}

export async function approveResolution(complaintId: string, studentId: string, resolutionId: string) {
  const session = await getServerSession(authOptions)
  if(!session?.user) throw new Error("Unauthorized")

  if (session.user.role !== "STUDENT") {
    throw new Error("Only student can approve resolutions");
  }

  const updatedResolution = await prisma.resolution.update({
    where: {
      id: resolutionId
    },
    data: {
      status: "APPROVED"
    },
  })

  if(!updatedResolution) {
    return {
      success: false,
      message: "Error updating resolution status"
    }
  }

  const updatedComplaint = await prisma.complaint.update({
    where: {
      id: complaintId
    },
    data: {
      status: "RESOLVED"
    }
  })

  if(!updatedComplaint) {
    return {
      success: false,
      message: "Error updating complaint status"
    }
  }

  await prisma.complaintAudit.create({
    data: {
      actorId: studentId,
      complaintId,
      type: "STATUS_CHANGED",
      message: "Resolution approved",
    }
  })

  revalidatePath(`/complaints/${complaintId}`)

  return {
    success: true,
    message: "Resolution approved"
  }
}

export async function disapproveResolution(complaintId: string, studentId: string, resolutionId: string, reason: string) {
  const session = await getServerSession(authOptions)
  if(!session?.user) throw new Error("Unauthorized")

  if (session.user.role !== "STUDENT") {
    throw new Error("Only student can disapprove resolutions");
  }

  const updatedResolution = await prisma.resolution.update({
    where: {
      id: resolutionId
    },
    data: {
      status: "REJECTED",
      rejectionReason: reason,
      rejectedAt: new Date()
    },
  })

  if(!updatedResolution) {
    return {
      success: false,
      message: "Error updating resolution status"
    }
  }

  await prisma.complaintAudit.create({
    data: {
      actorId: studentId,
      complaintId,
      type: "STATUS_CHANGED",
      message: "Resolution rejected",
    }
  })

  revalidatePath(`/complaints/${complaintId}`)

  return {
    success: true,
    message: "Resolution rejected"
  }
}