"use client"

import { formatDistanceToNowStrict } from "date-fns"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { deleteComment, editComment } from "@/app/complaints/[id]/action"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Pencil, Trash2, Loader2, X, Check, EllipsisVertical } from "lucide-react"

type CommentDetails = {
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
}[]

function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default function CommentItem({ comment }: { comment: CommentDetails[number] }) {
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const { data: session } = useSession()

    const { id, description, complaintId, user, createdAt, updatedAt } = comment

    const isOwner = session?.user?.id === user.id
    const isEdited = updatedAt > createdAt

    const handleEditComment = async () => {
        const trimmed = text.trim()
        if (!trimmed) return
        setLoading(true)
        try {
            const response = await editComment(complaintId, id, user.id, text)
            console.log("Res", response)
            setIsEditing(false)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteComment = async () => {
        setLoading(true)
        try {
            const response = await deleteComment(complaintId, id, user.id)
            console.log("Res", response)
        } finally {
            setLoading(false)
        }
    }

    const openEdit = () => {
        setText(description)
        setIsEditing(true)
    }

    const cancelEdit = () => {
        setText("")
        setIsEditing(false)
    }

    if (!session?.user) redirect("/sign-in")

    return (
        <div className="flex gap-3 group">
            <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                <AvatarFallback className="text-[11px] bg-muted text-muted-foreground font-semibold">
                    {initials(user.name)}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-baseline gap-2 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">
                            {user.name}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                            {formatDistanceToNowStrict(new Date(createdAt), { addSuffix: true })}
                        </span>
                        {
                            isEdited && (
                                <span className="text-xs font-medium text-muted-foreground truncate">
                                    (Edited)
                                </span>
                            )
                        }
                    </div>

                    {/* Dropdown — only visible to comment owner */}
                    {isOwner && !isEditing && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg text-muted-foreground focus:opacity-100 transition-opacity shrink-0 data-[state=open]:opacity-100"
                                >
                                    <EllipsisVertical className="h-4 w-4" />
                                    <span className="sr-only">Comment options</span>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                sideOffset={4}
                                className="w-40 rounded-xl border border-border shadow-lg p-1"
                            >
                                <DropdownMenuItem
                                    onClick={openEdit}
                                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer"
                                >
                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                    Edit
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="my-1" />

                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={handleDeleteComment}
                                    disabled={loading}
                                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive focus:text-destructive cursor-pointer"
                                >
                                    {loading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                    {loading ? "Deleting…" : "Delete"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Comment body — view or edit mode */}
                {isEditing ? (
                    <div className="space-y-2 mt-1">
                        <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={3}
                            autoFocus
                            className="text-sm resize-none rounded-xl bg-muted/30 border-border focus-visible:ring-1 focus-visible:ring-primary/30"
                        />
                        <div className="flex items-center gap-2 justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEdit}
                                disabled={loading}
                                className="h-7 px-3 text-xs rounded-lg gap-1.5"
                            >
                                <X className="h-3.5 w-3.5" />
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleEditComment}
                                disabled={!text.trim() || loading}
                                className="h-7 px-3 text-xs rounded-lg gap-1.5"
                            >
                                {loading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Check className="h-3.5 w-3.5" />
                                )}
                                {loading ? "Saving…" : "Save"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-foreground/80 leading-relaxed">{description}</p>
                )}
            </div>
        </div>
    )
}