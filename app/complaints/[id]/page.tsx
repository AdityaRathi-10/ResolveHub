import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { MediaGallery } from "@/components/MediaGallery"
import {
    ArrowLeft,
    CalendarClock,
    Image as ImageIcon,
    TrendingUp,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import UpVotes from "@/components/Upvotes"
import ComplaintActivityButton from "@/components/ComplaintActivityButton"
import ComplaintAudit from "@/components/ComplaintAudit"
import CommentsSection from "@/components/CommentsSection"
import { formatDate, formatDistanceToNowStrict } from "date-fns"
import ComplaintActions from "@/components/ComplaintActions"
import ComplaintStatus from "@/components/ComplaintStatus"
import ComplaintAssignTo from "@/components/ComplaintAssignTo"
import Resolutions from "@/components/Resolutions"

type Priority = "HIGH" | "MEDIUM" | "LOW"

type ResolutionStatus = "PENDING" | "APPROVED" | "REJECTED" | "DISCARDED"

// Configs

const PRIORITY_CONFIG: Record<Priority, { label: string; dot: string; badge: string }> = {
    HIGH: {
        label: "High Priority",
        dot: "bg-red-500",
        badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    },
    MEDIUM: {
        label: "Medium Priority",
        dot: "bg-amber-500",
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    LOW: {
        label: "Low Priority",
        dot: "bg-emerald-500",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
}

// Helpers

function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// Page

export default async function ComplaintDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/sign-in")
    const { id } = await params

    const complaint = await prisma.complaint.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, email: true } },
            assignedTo: { select: { id: true, name: true, email: true } },
            commentList: {
                include: { user: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: "desc" },
            },
            resolutions: {
                include: { caretaker: { select: { name: true, email: true } } },
                orderBy: { createdAt: "desc" },
            },
            upvotes: {
                include: { user: { select: { id: true } } }
            }
        },
    })
    if (!complaint) notFound()

    const audit = await prisma.complaintAudit.findMany({
        where: {
            complaintId: complaint.id
        },
        include: {
            actor: {
                select: { name: true, email: true },
            },
            complaint: {
                select: { status: true, assignedToId: true }
            },
        },
        orderBy: { createdAt: "desc" },
    })

    const lastResolutionStatus = await prisma.resolution.findFirst({
        where: {
            complaintId: complaint.id
        },
        orderBy: {
            createdAt: "desc"
        }
    })


    const priority = PRIORITY_CONFIG[complaint.priority]
    const isLikedByUser = Boolean(complaint.upvotes.find((upvote) => upvote.userId === session.user.id))

    const isEdited = complaint.updatedAt > complaint.createdAt
    const isOwner = session.user.id === complaint.userId
    const canEdit = isOwner && complaint.status === "PENDING"

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">

                {/* Breadcrumb */}
                <div className="flex items-center justify-between mb-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/complaints"
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Complaints
                        </Link>
                        <span className="text-muted-foreground/40">/</span>
                        <span className="text-sm text-foreground/60 truncate max-w-50">
                            {complaint.title}
                        </span>
                    </div>

                    {/* Right side: activity button + owner actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <ComplaintActivityButton
                            assigned={!!complaint.assignedTo}
                            complaintId={complaint.id}
                            assignedTo={complaint.assignedToId}
                            status={complaint.status}
                            createdBy={complaint.userId}
                        />
                        {isOwner && (
                            <ComplaintActions
                                complaintId={complaint.id}
                                authorId={complaint.userId}
                                canEdit={canEdit}
                                size="sm"
                            />
                        )}
                    </div>
                </div>

                {/* Main content */}
                <div className="space-y-5">

                    {/* Header card */}
                    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
                        {/* Priority accent bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${priority.dot}`} />

                        <div className="pl-4">
                            {/* Badges row */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <ComplaintStatus
                                    complaintId={complaint.id}
                                    complaintStatus={complaint.status}
                                />
                                {complaint.isEscalated && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-purple-200 text-purple-800 border border-purple-500/20">
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        Escalated
                                    </span>
                                )}
                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${priority.badge}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                                    {priority.label}
                                </span>
                                {isEdited && (
                                    <span className="text-sm text-muted-foreground">
                                        (Edited)
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug mb-4">
                                {complaint.title}
                            </h1>

                            {/* Description */}
                            {complaint.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                                    {complaint.description}
                                </p>
                            )}

                            {/* Meta grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/60">
                                {/* Submitted by */}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1.5">Submitted by</p>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                                                {initials(complaint.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium text-foreground truncate">
                                            {complaint.user.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Assigned to */}
                                <ComplaintAssignTo
                                    complaintId={complaint.id}
                                    assignedToName={complaint?.assignedTo?.name}
                                />

                                {/* Deadline */}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1.5">Deadline</p>
                                    {complaint.deadline ? (
                                        <div className={`flex items-center gap-1.5 text-sm font-medium ${complaint.isEscalated ? "text-red-500" : "text-foreground"}`}>
                                            <CalendarClock className="h-4 w-4 shrink-0" />
                                            {complaint.deadline.toLocaleString()}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No deadline</span>
                                    )}
                                </div>

                                {/* Upvotes */}
                                <UpVotes
                                    complaintId={complaint.id}
                                    upvotesCount={complaint.upvotesCount}
                                    hasUpvoted={isLikedByUser}
                                    isStudent={session.user.role === "STUDENT"}
                                />
                            </div>

                            {/* Timestamps */}
                            <div className="mt-4 pt-3 border-t border-border/40">
                                <span className="text-xs text-muted-foreground">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>Created {formatDistanceToNowStrict(new Date(complaint.createdAt), { addSuffix: true })}</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{formatDate(new Date(complaint.createdAt), "PPpp")}</p>
                                        </TooltipContent>
                                    </Tooltip>

                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    {complaint.media.length > 0 && (
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                <h2 className="text-sm font-semibold text-foreground" >
                                    Attachments
                                </h2>
                                <span className="ml-auto text-xs text-muted-foreground">
                                    {complaint.media.length} file{complaint.media.length !== 1 ? "s" : ""}
                                </span>
                            </div>
                            <MediaGallery urls={complaint.media} />
                        </div>
                    )}

                    {/* Resolutions */}
                    <Resolutions
                        initialResolutions={complaint.resolutions}
                        complaintId={complaint.id}
                        authorId={complaint.userId}
                        caretakerId={complaint.assignedToId}
                    />

                    <Separator className="mb-5" />
                    
                    {/* Complaint Audit */}
                    <ComplaintAudit
                        complaintId={complaint.id}
                        caretakerId={complaint.assignedToId}
                        audit={audit}
                        lastResolutionStatus={lastResolutionStatus?.status as ResolutionStatus}
                        complaintStatus={complaint.status}
                    />

                    <Separator className="mb-5" />

                    {/* Comments Section */}
                    <CommentsSection
                        comments={complaint.commentList}
                        complaintId={complaint.id}
                    />
                </div>
            </div>
        </main>
    )
}