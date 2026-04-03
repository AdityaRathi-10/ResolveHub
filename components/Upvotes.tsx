"use client"

import { toggleUpvote } from "@/app/complaints/[id]/actions/complaint.actions";
import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface UpvoteProps {
    complaintId: string
    upvotesCount: number
    hasUpvoted: boolean
    isStudent: boolean
}

export default function UpVotes({ complaintId, upvotesCount, hasUpvoted, isStudent }: UpvoteProps) {
    const [count, setCount] = useState(upvotesCount)
    const [liked, setLiked] = useState(hasUpvoted)
    const [isLiking, setIsLiking] = useState(false)

    const handleUpvote = async () => {
        if(!liked) {
            setCount((prev) => prev + 1)
        }
        else {
            setCount((prev) => prev - 1)
        }
        setLiked(!liked)
        setIsLiking(true)
        try {
            const response = await toggleUpvote(complaintId)
            setLiked(response.hasUpvoted)
        } catch {
            setLiked(liked)
            setCount(upvotesCount)
        } finally {
            setIsLiking(false)
        }
    }

    return (
        <div>
            <p className="text-xs text-muted-foreground mb-1.5">Upvotes</p>
            <div className="flex items-center gap-1.5">
                <Button 
                    className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer text-foreground hover:bg-primary/10 hover:text-primary transition-colors px-2.5 py-1 rounded-lg border border-border bg-muted"
                    onClick={handleUpvote}
                    disabled={isLiking || !isStudent}
                >
                    <ChevronUp className="h-4 w-4" />
                    {count}
                </Button>
            </div>
        </div>
    )
}