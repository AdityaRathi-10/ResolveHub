"use client"

import {
    UserPlus,
    UserMinus,
    RefreshCw,
    TrendingUp,
    ShieldCheck,
    RotateCcw,
    GitCommitHorizontal,
} from "lucide-react"
import { format, formatDistanceToNowStrict } from "date-fns"
import MarkAsResolved from "./MarkAsResolved"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { getComplaintAudit } from "@/app/complaints/[id]/actions/complaint.actions"

// Types

type Status = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"

type AuditType =
    | "ASSIGNED"
    | "UNASSIGNED"
    | "STATUS_CHANGED"
    | "ESCALATED"
    | "RESOLUTION_SUBMITTED"
    | "REOPENED"

type AuditEntry = {
    id: string
    type: AuditType
    message: string
    createdAt: Date
    actor: {
        name: string
        email: string
    },
    complaint: {
        status: Status
        assignedToId: string | null
    }
}

// Per-event config

const AUDIT_CONFIG: Record<
    AuditType,
    {
        icon: React.ElementType
        iconBg: string
        iconColor: string
        label: string
    }
> = {
    ASSIGNED: {
        icon: UserPlus,
        iconBg: "bg-blue-500/10 border-blue-500/20",
        iconColor: "text-blue-500",
        label: "Assigned",
    },
    UNASSIGNED: {
        icon: UserMinus,
        iconBg: "bg-slate-400/10 border-slate-400/20",
        iconColor: "text-slate-400",
        label: "Unassigned",
    },
    STATUS_CHANGED: {
        icon: RefreshCw,
        iconBg: "bg-violet-500/10 border-violet-500/20",
        iconColor: "text-violet-500",
        label: "Status changed",
    },
    ESCALATED: {
        icon: TrendingUp,
        iconBg: "bg-red-500/10 border-red-500/20",
        iconColor: "text-red-500",
        label: "Escalated",
    },
    RESOLUTION_SUBMITTED: {
        icon: ShieldCheck,
        iconBg: "bg-emerald-500/10 border-emerald-500/20",
        iconColor: "text-emerald-500",
        label: "Resolution submitted",
    },
    REOPENED: {
        icon: RotateCcw,
        iconBg: "bg-amber-500/10 border-amber-500/20",
        iconColor: "text-amber-500",
        label: "Reopened",
    },
}

// Single event row

function AuditRow({
    entry,
    isLast,
}: {
    entry: AuditEntry
    isLast: boolean
}) {
    const config = AUDIT_CONFIG[entry.type]
    const Icon = config.icon

    return (
        <div className="relative flex gap-4">
            {/* Vertical timeline line */}
            {!isLast && (
                <div className="absolute left-3.75 top-8 bottom-0 w-px bg-border" />
            )}

            {/* Icon node */}
            <div className={`relative z-10 h-8 w-8 shrink-0 rounded-full border flex items-center justify-center ${config.iconBg}`}>
                <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-6">
                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    {/* Actor name */}
                    <span className="text-sm font-semibold text-foreground">
                        {entry.actor.name}
                    </span>

                    {/* Action label */}
                    <span className="text-sm text-muted-foreground">
                        {entry.message}
                    </span>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-2 mt-1">
                    <span
                        className="text-xs text-muted-foreground/70"
                    >
                        {formatDistanceToNowStrict(new Date(entry.createdAt), { addSuffix: true })}
                    </span>
                    <span className="text-muted-foreground/30 text-xs">·</span>
                    <span className="text-xs text-muted-foreground/50">
                        {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                </div>
            </div>
        </div>
    )
}

// Component

export default function ComplaintAudit({ audit, lastResolution, complaintId, caretakerId, complaintStatus }: {
    audit: AuditEntry[],
    lastResolution: any,
    complaintId: string,
    caretakerId: string | null,
    complaintStatus: Status
}) {
    const [initialAudit, setInitialAudit] = useState<AuditEntry[]>(audit)
    const { data: session } = useSession()

    useEffect(() => {
        const channel = supabase
            .channel('complaint-audit-realtime')
            .on(
                'postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'ComplaintAudit',
            },
                async () => {
                    const { data: complaintAudit } = await getComplaintAudit(complaintId)
                    setInitialAudit(complaintAudit)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    })

    if (!session?.user) return null

    if (initialAudit.length === 0) {
        return (
            <h2
                className="text-sm font-semibold text-foreground"
            >
                No activity
            </h2>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
                <GitCommitHorizontal className="h-4 w-4 text-muted-foreground" />
                <h2
                    className="text-sm font-semibold text-foreground"
                >
                    Activity
                </h2>
                {initialAudit.length > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                        {initialAudit.length} event{initialAudit.length !== 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* Timeline */}
            {initialAudit.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mb-3">
                        <GitCommitHorizontal className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
                </div>
            ) : (
                <div className="pl-1">
                    {initialAudit.map((entry, i) => (
                        <AuditRow
                            key={entry.id}
                            entry={entry as AuditEntry}
                            isLast={i === initialAudit.length - 1}
                        />
                    ))}
                </div>
            )}

            <MarkAsResolved
                complaintId={complaintId}
                resolutionStatus={lastResolution?.status as string}
                complaintStatus={complaintStatus}
                assignedToId={caretakerId}
                currentUserId={session.user.id}
            />
        </div>
    )
}