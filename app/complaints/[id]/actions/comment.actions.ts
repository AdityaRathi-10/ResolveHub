"use server"

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function createComment(complaintId: string, text: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const newComment = await prisma.comment.create({
    data: {
      description: text,
      complaintId,
      userId: session.user.id,
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  if (!newComment) {
    return {
      success: false,
      message: "Error creating comment",
    };
  }

  return {
    success: true,
    message: "Comment added successfully",
    data: newComment,
  };
}

export async function editComment(
  commentId: string,
  commentedBy: string,
  text: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.id !== commentedBy) {
    throw new Error("Unauthorized");
  }

  const editedComment = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      description: text,
    },
  });

  if (!editedComment) {
    return {
      success: false,
      message: "Error editing comment",
    };
  }

  return {
    success: true,
    message: "Comment edited successfully",
    data: editedComment,
  };
}

export async function deleteComment(commentId: string, commentedBy: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.id !== commentedBy) {
    throw new Error("Unauthorized");
  }

  const deletedComment = await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });

  if (!deletedComment) {
    return {
      success: false,
      message: "Error deleting comment",
    };
  }

  return {
    success: true,
    message: "Comment deleted successfully",
    data: deletedComment.id,
  };
}