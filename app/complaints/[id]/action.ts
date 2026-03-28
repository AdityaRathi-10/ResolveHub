"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

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
