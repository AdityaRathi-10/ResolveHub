"use client"

import { getComplaintStatus } from "@/app/complaints/[id]/actions/complaint.actions";
import { supabase } from "@/lib/supabase/client";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react"
import { useEffect, useState } from "react";

type Status = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"

interface ComplaintStatusProps {
    complaintId: string;
    complaintStatus: Status
}

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; class: string; bg: string }> = {
    PENDING: { label: "Pending", icon: Clock, class: "text-muted-foreground", bg: "bg-muted" },
    IN_PROGRESS: { label: "In Progress", icon: Loader2, class: "text-blue-500", bg: "bg-blue-500/10" },
    RESOLVED: { label: "Resolved", icon: CheckCircle2, class: "text-emerald-500", bg: "bg-emerald-500/10" },
    CLOSED: { label: "Closed", icon: XCircle, class: "text-muted-foreground", bg: "bg-muted" },
}

export default function ComplaintStatus({ complaintId, complaintStatus }: ComplaintStatusProps) {
    const [currentStatus, setCurrentStatus] = useState<Status>(complaintStatus)

    const status = STATUS_CONFIG[currentStatus]
    const StatusIcon = status.icon

    useEffect(() => {
        const channel = supabase
            .channel('complaint-status-realtime')
            .on(
                'postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'Complaint',
                    filter: `id=eq.${complaintId}`,
                },
                async () => {
                    const { data } = await getComplaintStatus(complaintId)
                    if (data?.status) {
                        setCurrentStatus(data?.status)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    })

    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${status.bg} ${status.class}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
        </span>
    )
}