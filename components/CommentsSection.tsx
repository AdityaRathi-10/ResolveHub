"use client"

import { MessageSquare } from 'lucide-react'
import CommentItem from './CommentItem'
import { Badge } from "@/components/ui/badge"
import { Separator } from './ui/separator'
import { CommentBox } from './CommentBox'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { createComment, deleteComment, editComment } from '@/app/complaints/[id]/action'

type Comment = {
    id: string
    description: string
    complaintId: string
    user: {
        id: string
        name: string
        email: string
    }
    createdAt: Date
    updatedAt: Date
}

interface CommentSectionProps {
    comments: Comment[]
    complaintId: string
}

export default function CommentsSection({ comments, complaintId }: CommentSectionProps) {
    const [currentComments, setCurrentComments] = useState<Comment[]>(comments)
    const { data: session, status } = useSession()

    if(status === "loading") return null

    if (!session?.user) redirect("/sign-in")

    const handleCreateComment = async (description: string) => {
        const tempId = crypto.randomUUID()
        const newComment = {
            id: tempId,
            description,
            complaintId,
            user: {
                id: session.user.id!,
                name: session.user.name!,
                email: session.user.email!
            },
            createdAt: new Date(),
            updatedAt: new Date()
        }

        setCurrentComments((prev) => [newComment, ...prev])

        try {
            const { success, data } = await createComment(complaintId, description)
            if (success && data) {
                const { id, complaintId, description, createdAt, updatedAt } = data
                setCurrentComments((prev) =>
                    prev.map((c) => (c.id === tempId ? {
                        id,
                        description,
                        complaintId,
                        user: newComment.user,
                        createdAt,
                        updatedAt
                    } : c))
                )
            } else {
                setCurrentComments((prev) => prev.filter((c) => c.id !== tempId))
            }
        } catch {
            setCurrentComments((prev) => prev.filter((c) => c.id !== tempId))
        }
    }

    const handleEditComment = async (commentId: string, description: string) => {
        const prev = currentComments

        const target = currentComments.find((c) => c.id === commentId)
        if (!target) return

        setCurrentComments((prev) => prev.map((c) => (
            c.id === commentId ? { ...c, description, updatedAt: new Date() } : c
        )))
        try {
            const response = await editComment(commentId, target.user.id, description)
            const { success, data } = response
            if (success && data) {
                const { description, updatedAt } = data
                setCurrentComments((prev) =>
                    prev.map((c) =>
                        c.id === commentId ? {
                            ...c,
                            description,
                            updatedAt
                        } : c
                    )
                )
            } else {
                setCurrentComments(prev)
            }
        } catch {
            setCurrentComments(prev)
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        const prev = currentComments

        const target = currentComments.find((c) => c.id === commentId)
        if (!target) return

        setCurrentComments((prev) => prev.filter((c) => c.id !== commentId))

        try {
            const response = await deleteComment(commentId, target.user.id)
            if (!response.success) {
                setCurrentComments(prev)
            }
        } catch {
            setCurrentComments(prev)
        }
    }


    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-5">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground" >
                    Discussion
                </h2>
                <Badge variant="secondary" className="ml-auto text-xs">
                    {currentComments.length}
                </Badge>
            </div>

            {/* Existing comments */}
            {currentComments.length > 0 ? (
                <div className="space-y-5 mb-6">
                    {currentComments.map((comment, i) => (
                        <div key={comment.id}>
                            <CommentItem
                                comment={{
                                    id: comment.id,
                                    description: comment.description,
                                    complaintId: comment.complaintId,
                                    user: {
                                        id: comment.user.id,
                                        name: comment.user.name,
                                        email: comment.user.email
                                    },
                                    createdAt: comment.createdAt,
                                    updatedAt: comment.updatedAt
                                }}
                                onEdit={handleEditComment}
                                onDelete={handleDeleteComment}
                            />
                            {i < currentComments.length - 1 && (
                                <Separator className="mt-5" />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment.</p>
                </div>
            )}

            <Separator className="mb-5" />

            {/* Comment box */}
            <CommentBox
                currentUser={{
                    name: session.user.name ?? "User",
                    email: session.user.email ?? "",
                }}
                complaintId={complaintId}
                onCreate={handleCreateComment}
            />
        </div>
    )
}