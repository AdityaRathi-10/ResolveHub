"use client"

import { useEffect, useState } from "react"
import { ResolutionCard } from "./ResolutionCard"
import { supabase } from "@/lib/supabase/client"
import { getComplaintResolutions } from "@/app/complaints/[id]/actions/complaint.actions"
import { useSession } from "next-auth/react"

type ResolutionStatus = "PENDING" | "APPROVED" | "REJECTED"

type Resolution = {
    id: string
    description?: string | null
    media: string[]
    status: ResolutionStatus
    rejectionReason?: string | null
    rejectedAt?: Date | null
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
    })

    if (!session?.user) return null

    return (
        <>
            {
                resolutions?.map((res, index) => (
                    <ResolutionCard
                        key={res.id}
                        resolution={res}
                        attemptIndex={index + 1}
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
        </>
    )
}