import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MediaGallery } from "@/components/MediaGallery"
import { CommentBox } from "@/components/CommentBox"
import {
    ArrowLeft,
    Clock,
    CheckCircle2,
    Loader2,
    XCircle,
    CalendarClock,
    UserCheck,
    MessageSquare,
    ShieldCheck,
    Image as ImageIcon,
    TrendingUp,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import UpVotes from "@/components/Upvotes"
import ComplaintActivityButton from "@/components/ComplaintActivityButton"
import ComplaintAudit from "@/components/ComplaintAudit"
import { formatDistanceToNowStrict } from "date-fns"
import { ResolutionCard } from "@/components/ResolutionCard"

type Priority = "HIGH" | "MEDIUM" | "LOW"
type Status = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
type ResolutionStatus = "PENDING" | "APPROVED" | "REJECTED"

type ComplaintDetail = {
    id: string
    title: string
    description?: string | null
    media: string[]
    priority: Priority
    status: Status
    upvotesCount: number
    deadline?: Date | null
    createdAt: Date
    updatedAt: Date
    user: { id: string; name: string; email: string }
    assignedTo?: { id: string; name: string; email: string } | null
    commentList: {
        id: string
        description: string
        createdAt: Date
        user: { name: string; email: string }
    }[]
    resolutions: {
        id: string
        description?: string | null
        media: string[]
        status: ResolutionStatus
        createdAt: Date
        caretaker: { name: string; email: string }
    }[]
}

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

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; class: string; bg: string }> = {
    PENDING: { label: "Pending", icon: Clock, class: "text-muted-foreground", bg: "bg-muted" },
    IN_PROGRESS: { label: "In Progress", icon: Loader2, class: "text-blue-500", bg: "bg-blue-500/10" },
    RESOLVED: { label: "Resolved", icon: CheckCircle2, class: "text-emerald-500", bg: "bg-emerald-500/10" },
    CLOSED: { label: "Closed", icon: XCircle, class: "text-muted-foreground", bg: "bg-muted" },
}

// Helpers

function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// Sub-components

function CommentItem({ comment }: { comment: ComplaintDetail["commentList"][number] }) {
    return (
        <div className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                <AvatarFallback className="text-[11px] bg-muted text-muted-foreground font-semibold">
                    {initials(comment.user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{comment.user.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNowStrict(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{comment.description}</p>
            </div>
        </div>
    )
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
                include: { user: { select: { name: true, email: true } } },
                orderBy: { createdAt: "asc" },
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

    const priority = PRIORITY_CONFIG[complaint.priority]
    const status = STATUS_CONFIG[complaint.status]
    const StatusIcon = status.icon
    const isLikedByUser = Boolean(complaint.upvotes.find((upvote) => upvote.userId === session.user.id))

    async function submitComment(complaintId: string, text: string) {
        "use server"
        await prisma.comment.create({
            data: {
                description: text,
                complaintId,
                userId: session!.user.id,
            },
        })
        revalidatePath(`/complaints/${complaintId}`)
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">

                {/* Breadcrumb */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 mb-6">
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
                    <ComplaintActivityButton
                        assigned={!!complaint.assignedTo}
                        complaintId={complaint.id}
                        assignedTo={complaint.assignedToId}
                        status={complaint.status}
                        createdBy={complaint.userId}
                    />
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
                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${status.bg} ${status.class}`}>
                                    <StatusIcon className="h-3.5 w-3.5" />
                                    {status.label}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${priority.badge}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                                    {priority.label}
                                </span>
                                {complaint.isEscalated && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-purple-200 text-purple-800 border border-purple-500/20">
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        Escalated
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1
                                className="text-xl sm:text-2xl font-bold text-foreground leading-snug mb-4"
                                style={{ fontFamily: "'Sora', sans-serif" }}
                            >
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
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1.5">Assigned to</p>
                                    {complaint.assignedTo ? (
                                        <div className="flex items-center gap-2">
                                            <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <span className="text-sm font-medium text-foreground truncate">
                                                {complaint.assignedTo.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Unassigned</span>
                                    )}
                                </div>

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
                                    Created {complaint.createdAt.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    {complaint.media.length > 0 && (
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
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
                    {complaint.resolutions.length > 0 && (
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
                                    Resolutions
                                </h2>
                                <Badge variant="secondary" className="ml-auto text-xs">
                                    {complaint.resolutions.length}
                                </Badge>
                            </div>
                            <div className="space-y-3">
                                {complaint.resolutions.map((res, index) => (
                                    <>
                                    <ResolutionCard
                                        key={res.id}
                                        resolution={res}
                                        attemptIndex={index + 1}
                                        total={complaint.resolutions.length}
                                        canReview={
                                            session.user.role === "STUDENT" &&
                                            session.user.id === complaint.user.id &&
                                            res.status === "PENDING"
                                        }
                                        complaintId={complaint.id}
                                        studentId={complaint.userId}
                                        caretakerId={complaint.assignedToId}
                                    />
                                    </>
                                ))}
                            </div>
                        </div>
                    )}

                    <Separator className="mb-5" />

                    <ComplaintAudit
                        complaintId={complaint.id}
                        caretakerId={complaint.assignedToId}
                    />

                    <Separator className="mb-5" />

                    {/* Comments */}
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-5">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
                                Discussion
                            </h2>
                            <Badge variant="secondary" className="ml-auto text-xs">
                                {complaint.commentList.length}
                            </Badge>
                        </div>

                        {/* Existing comments */}
                        {complaint.commentList.length > 0 ? (
                            <div className="space-y-5 mb-6">
                                {complaint.commentList.map((comment, i) => (
                                    <div key={comment.id}>
                                        <CommentItem comment={comment} />
                                        {i < complaint.commentList.length - 1 && (
                                            <Separator className="mt-5" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 mb-4">
                                <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment.</p>
                            </div>
                        )}

                        <Separator className="mb-5" />

                        {/* Comment box */}
                        <CommentBox
                            complaintId={complaint.id}
                            currentUser={{
                                name: session.user.name ?? "User",
                                email: session.user.email ?? "",
                            }}
                            onSubmit={submitComment}
                        />
                    </div>
                </div>
            </div>
        </main>
    )
}