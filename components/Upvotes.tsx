"use client"

import { toggleUpvote } from "@/app/complaints/[id]/action";
import { ChevronUp } from "lucide-react";
import { useState } from "react";

interface UpvoteProps {
    complaintId: string
    upvotesCount: number
    hasUpvoted: boolean
}

export default function UpVotes({ complaintId, upvotesCount, hasUpvoted }: UpvoteProps) {
    const [count, setCount] = useState(upvotesCount)
    const [liked, setLiked] = useState(hasUpvoted)
    const [isLiking, setIsLiking] = useState(false)

    console.log("l", liked)

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
        } catch (error) {
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
                <button 
                    className={`flex items-center gap-1.5 text-sm font-semibold cursor-pointer text-foreground ${liked ? "hover:bg-green-300" : "hover:bg-primary/10"} hover:text-primary transition-colors px-2.5 py-1 rounded-lg border border-border ${liked ? "bg-green-200" : "bg-muted"}`}
                    onClick={handleUpvote}
                    disabled={isLiking}
                >
                    <ChevronUp className="h-4 w-4" />
                    {count}
                </button>
            </div>
        </div>
    )
}