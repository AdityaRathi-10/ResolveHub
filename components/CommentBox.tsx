"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizonal } from "lucide-react"

interface CommentBoxProps {
    complaintId: string
    currentUser: {
        name: string
        email: string
    }
    onCreate: (description: string) => Promise<void>
}

export function CommentBox({ currentUser, onCreate }: CommentBoxProps) {
    const [text, setText] = useState("")

    const initials = currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    const handleCreateComment = async () => {
        const trimmed = text.trim()
        if (!trimmed) return
        setText("")
        await onCreate(trimmed)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            handleCreateComment()
        }
    }

    return (
        <div className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-semibold">
                    {initials}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex flex-col gap-2">
                <div className="relative rounded-xl border border-border bg-background focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-150">
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a comment… (⌘+Enter to submit)"
                        rows={3}
                        className="border-0 bg-transparent focus-visible:ring-0 resize-none text-sm placeholder:text-muted-foreground/50 p-3"
                    />
                    <div className="flex items-center justify-between px-3 pb-2.5">
                        <span className="text-xs text-muted-foreground/60">
                            {text.length > 0 ? `${text.length} chars` : ""}
                        </span>
                        <Button
                            size="sm"
                            onClick={handleCreateComment}
                            disabled={!text.trim()}
                            className="h-7 px-3 text-xs gap-1.5"
                        >
                            <SendHorizonal className="h-3.5 w-3.5" />
                            Comment
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}