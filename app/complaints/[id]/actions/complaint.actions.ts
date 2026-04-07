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
      message: `Assigned to ${username}`,
    },
  });

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
      status: "PENDING"
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
      message: `Unassigned ${username}`,
    },
  });

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
      id: complaintId,
    },
    data: {
      status: "IN_PROGRESS",
    },
  });

  if (!updated) {
    return {
      success: false,
      message: "Error updating status",
    };
  }

  await prisma.complaintAudit.create({
    data: {
      complaintId,
      actorId: userId,
      type: "STATUS_CHANGED",
      message: `Complaint is now ${updated.status.replaceAll("_", " ")} state`,
    },
  });

  revalidatePath(`/complaints/${complaintId}`);

  return {
    success: true,
    message: "Complaint is now in progress",
  };
}

export async function deleteComplaint(complaintId: string, authorId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.id !== authorId) {
    throw new Error("Unauthorized");
  }

  await prisma.comment.deleteMany({
    where: { complaintId },
  });

  await prisma.complaintAudit.deleteMany({
    where: { complaintId },
  });

  await prisma.upvotes.deleteMany({
    where: { complaintId },
  });

  const deletedComplaint = await prisma.complaint.delete({
    where: { id: complaintId },
  });

  if (!deletedComplaint) {
    return {
      success: false,
      message: "Error deleting complaint",
    };
  }

  revalidatePath("/complaints");

  return {
    success: true,
    message: "Complaint deleted successfully",
  };
}

export async function closeComplaint(
  complaintId: string,
  actorId: string | null,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !actorId) throw new Error("Unauthorized");

  const updatedComplaint = await prisma.complaint.update({
    where: {
      id: complaintId,
    },
    data: {
      status: "CLOSED",
    },
  });

  if (!updatedComplaint) {
    return {
      success: false,
      message: "Error closing complaint",
    };
  }

  await prisma.complaintAudit.create({
    data: {
      actorId,
      complaintId,
      type: "STATUS_CHANGED",
      message: "Complaint Closed!",
    },
  });

  return {
    success: true,
    message: "Complaint closed successfully",
  };
}

export async function getComplaintAssignment(complaintId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const assignment = await prisma.complaint.findUnique({
    where: {
      id: complaintId
    },
    select: { 
      assignedTo: {
        select: { id: true }
      },
      status: true
    }
  })

  return {
    success: true,
    data: assignment
  }
}

export async function getComplaintStatus(complaintId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const status = await prisma.complaint.findUnique({
    where: {
      id: complaintId
    },
    select: { 
      assignedTo: {
        select: { name: true }
      },
      status: true
    }
  })

  return {
    success: true,
    data: status
  }
}

export async function getComplaintResolutions(complaintId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const resolutions = await prisma.resolution.findMany({
    where: {
      complaintId
    },
    include: {
      caretaker: {
        select: { name: true, email: true }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return {
    success: true,
    data: resolutions
  }
}

export async function getComplaintAudit(complaintId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const complaintAudit = await prisma.complaintAudit.findMany({
    where: {
      complaintId
    },
    include: {
      complaint: {
        select: { status: true, assignedToId: true }
      },
      actor: {
        select: { name: true, email: true }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return {
    success: true,
    data: complaintAudit
  }
}
