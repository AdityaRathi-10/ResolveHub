"use client"

import { useEffect, useState } from "react"
import { ResolutionCard } from "./ResolutionCard"
import { supabase } from "@/lib/supabase/client"
import { getComplaintResolutions } from "@/app/complaints/[id]/actions/complaint.actions"
import { useSession } from "next-auth/react"
import { ShieldCheck } from "lucide-react"
import { Badge } from "./ui/badge"

type ResolutionStatus = "PENDING" | "APPROVED" | "REJECTED" | "DISCARDED"

type Resolution = {
    id: string
    description?: string | null
    media: string[]
    status: ResolutionStatus
    rejectionReason?: string | null
    rejectedAt?: Date | null
    number: number
    createdAt: Date
    caretaker: { name: string; email: string }
}

interface ResolutionsProps {
    initialResolutions: Resolution[] | null
    complaintId: string
    authorId: string
    caretakerId: string | null
}

export default function Resolutions({ initialResolutions, complaintId, authorId, caretakerId }: ResolutionsProps) {
    const [resolutions, setResolutions] = useState(initialResolutions)
    const { data: session } = useSession()

    useEffect(() => {
        const channel = supabase
            .channel('complaint-resolutions-realtime')
            .on(
                'postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'Resolution',
            },
                async () => {
                    const { data: latestResolutions } = await getComplaintResolutions(complaintId)
                    setResolutions(latestResolutions)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [complaintId])

    if (!session?.user) return null

    if (resolutions?.length === 0) {
        return null
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground" >
                    Resolutions
                </h2>
                <Badge variant="secondary" className="ml-auto text-xs">
                    {resolutions?.length}
                </Badge>
            </div>
            <div className="space-y-3">
                {
                    resolutions?.map((res, index) => (
                        <ResolutionCard
                            key={res.id}
                            resolution={res}
                            total={resolutions.length}
                            canReview={
                                session.user.role === "STUDENT" &&
                                session.user.id === authorId &&
                                res.status === "PENDING"
                            }
                            complaintId={complaintId}
                            studentId={authorId}
                            caretakerId={caretakerId}
                        />
                    ))
                }
            </div>
        </div>
    )
}