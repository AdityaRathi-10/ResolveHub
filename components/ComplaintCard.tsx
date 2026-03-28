import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Clock,
    CheckCircle2,
    Loader2,
    XCircle,
    AlertCircle,
    ChevronUp,
    MessageSquare,
    Paperclip,
    CalendarClock,
    UserCheck,
    TrendingUp,
} from "lucide-react"
import { escalateComplaints } from "@/lib/escalateComplaint"

export type ComplaintCardData = {
    id: string
    title: string
    description?: string | null
    priority: "HIGH" | "MEDIUM" | "LOW"
    status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
    upvotesCount: number
    media: string[]
    deadline?: Date | null
    createdAt: Date
    user: {
        name: string
        email: string
    }
    isEscalated: boolean
    // assignedTo?: {
    //     name: string
    // } | null
    _count: {
        commentList: number
        resolutions: number
    }
}

const PRIORITY_CONFIG = {
    HIGH: {
        label: "High",
        class: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        dot: "bg-red-500",
    },
    MEDIUM: {
        label: "Medium",
        class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        dot: "bg-amber-500",
    },
    LOW: {
        label: "Low",
        class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        dot: "bg-emerald-500",
    },
}

const STATUS_CONFIG = {
    PENDING: {
        label: "Pending",
        icon: Clock,
        class: "text-muted-foreground",
        bg: "bg-muted/60",
    },
    IN_PROGRESS: {
        label: "In Progress",
        icon: Loader2,
        class: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    RESOLVED: {
        label: "Resolved",
        icon: CheckCircle2,
        class: "text-emerald-500",
        bg: "bg-emerald-500/10",
    },
    CLOSED: {
        label: "Closed",
        icon: XCircle,
        class: "text-muted-foreground",
        bg: "bg-muted/60",
    },
}

export async function ComplaintCard({complaint}: {complaint: ComplaintCardData}) {
    const priority = PRIORITY_CONFIG[complaint.priority]
    const status = STATUS_CONFIG[complaint.status]
    const StatusIcon = status.icon

    await escalateComplaints()

    const initials = complaint.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    return (
        <Link href={`/complaints/${complaint.id}`} className="block group">
            <div className="relative bg-card border border-border rounded-2xl p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5">

                {/* Priority accent bar */}
                <div className={`absolute left-0 top-4 bottom-4 w-0.75 rounded-r-full ${priority.dot}`} />

                <div className="pl-3">
                    {/* Top row: status + priority + time */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                        { complaint.isEscalated && 
                            <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg bg-purple-200 text-purple-800`}>
                                <TrendingUp className="h-3 w-3" />
                                Escalated
                            </div>
                        }
                        <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg ${status.bg} ${status.class}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg border ${priority.class}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                                {priority.label}
                            </span>
                            <span className="text-xs text-muted-foreground hidden sm:block">
                                {complaint.createdAt.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3
                        className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1.5 leading-snug"
                        style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                        {complaint.title}
                    </h3>

                    {/* Description */}
                    {complaint.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                            {complaint.description}
                        </p>
                    )}

                    {/* Deadline warning */}
                    {complaint.isEscalated && (
                        <div className="flex items-center gap-1.5 text-xs text-red-500 mb-3">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Overdue · {complaint.deadline?.toLocaleString()}
                        </div>
                    )}
                    {complaint.deadline && !complaint.isEscalated && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                            <CalendarClock className="h-3.5 w-3.5" />
                            Due {complaint.deadline?.toLocaleString()}
                        </div>
                    )}

                    {/* Bottom row */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                        {/* Author */}
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground truncate max-w-25">
                                {complaint.user.name}
                            </span>
                        </div>

                        {/* Meta: upvotes, comments, attachments, assignee */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {/* {complaint.assignedTo && (
                                <span className="hidden sm:flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                    <UserCheck className="h-3.5 w-3.5" />
                                    {complaint.assignedTo.name.split(" ")[0]}
                                </span>
                            )} */}
                            {complaint.media.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <Paperclip className="h-3.5 w-3.5" />
                                    {complaint.media.length}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <MessageSquare className="h-3.5 w-3.5" />
                                {complaint._count.commentList}
                            </span>
                            <span className="flex items-center gap-1">
                                <ChevronUp className="h-3.5 w-3.5" />
                                {complaint.upvotesCount}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}