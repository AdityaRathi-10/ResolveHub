import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Clock,
    CheckCircle2,
    Loader2,
    XCircle,
    ChevronUp,
    MessageSquare,
    Paperclip,
    CalendarClock,
    AlertCircle,
    Plus,
    UserCheck,
    ClipboardList,
    TrendingUp,
    ArrowRight,
    Star,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNowStrict } from "date-fns"

// Types

type Priority = "HIGH" | "MEDIUM" | "LOW"
type Status = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"

type MyComplaint = {
    id: string
    title: string
    description?: string | null
    priority: Priority
    status: Status
    upvotesCount: number
    media: string[]
    deadline?: Date | null
    createdAt: Date
    updatedAt: Date
    assignedTo?: { name: string } | null       // for student view
    user?: { name: string; email: string }      // for caretaker view
    _count: {
        commentList: number
        resolutions: number
    }
}

// Configs

const PRIORITY_CONFIG = {
    HIGH: { label: "High", dot: "bg-red-500", badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", bar: "bg-red-500" },
    MEDIUM: { label: "Medium", dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", bar: "bg-amber-500" },
    LOW: { label: "Low", dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", bar: "bg-emerald-500" },
}

const STATUS_CONFIG = {
    PENDING: { label: "Pending", icon: Clock, class: "text-muted-foreground", bg: "bg-muted/80" },
    IN_PROGRESS: { label: "In Progress", icon: Loader2, class: "text-blue-500", bg: "bg-blue-500/10" },
    RESOLVED: { label: "Resolved", icon: CheckCircle2, class: "text-emerald-500", bg: "bg-emerald-500/10" },
    CLOSED: { label: "Closed", icon: XCircle, class: "text-muted-foreground", bg: "bg-muted/80" },
}

// Stat card

function StatCard({
    label,
    value,
    icon: Icon,
    iconClass,
    iconBg,
    sub,
}: {
    label: string
    value: number | string
    icon: React.ElementType
    iconClass: string
    iconBg: string
    sub?: string
}) {
    return (
        <div className="bg-card border border-border rounded-2xl px-5 py-4 flex items-center gap-4">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon className={`h-5 w-5 ${iconClass}`} />
            </div>
            <div className="min-w-0">
                <p
                    className="text-2xl font-bold text-foreground leading-none"
                >
                    {value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
                {sub && <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

// Complaint row (list item)

function ComplaintRow({
    complaint,
    viewerRole,
}: {
    complaint: MyComplaint
    viewerRole: "STUDENT" | "CARETAKER"
}) {
    const priority = PRIORITY_CONFIG[complaint.priority]
    const status = STATUS_CONFIG[complaint.status]
    const StatusIcon = status.icon

    const isOverdue =
        complaint.deadline &&
        new Date(complaint.deadline) < new Date() &&
        complaint.status !== "RESOLVED" &&
        complaint.status !== "CLOSED"

    return (
        <Link href={`/complaints/${complaint.id}`} className="block group">
            <div className="relative flex items-start gap-4 px-5 py-4 rounded-xl hover:bg-muted/40 transition-all duration-150">
                {/* Priority bar */}
                <div className={`absolute left-0 top-3 bottom-3 w-0.75 rounded-r-full ${priority.bar}`} />

                {/* Status icon bubble */}
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${status.bg}`}>
                    <StatusIcon className={`h-4 w-4 ${status.class}`} />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3
                                className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug"

                            >
                                {complaint.title}
                            </h3>
                            {complaint.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 leading-relaxed">
                                    {complaint.description}
                                </p>
                            )}
                        </div>

                        {/* Priority badge — desktop */}
                        <span className={`hidden sm:inline-flex shrink-0 items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${priority.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                            {priority.label}
                        </span>
                    </div>

                    {/* Bottom meta row */}
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${status.class}`}>
                            {status.label}
                        </span>

                        {/* Caretaker view: show student name */}
                        {viewerRole === "CARETAKER" && complaint.user && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="h-1 w-1 rounded-full bg-border" />
                                by {complaint.user.name}
                            </span>
                        )}

                        {/* Student view: show assignee */}
                        {viewerRole === "STUDENT" && (
                            complaint.assignedTo ? (
                                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                    <span className="h-1 w-1 rounded-full bg-border" />
                                    <UserCheck className="h-3 w-3" />
                                    {complaint.assignedTo.name}
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                                    <span className="h-1 w-1 rounded-full bg-border" />
                                    Unassigned
                                </span>
                            )
                        )}

                        {isOverdue && (
                            <span className="flex items-center gap-1 text-xs text-red-500">
                                <span className="h-1 w-1 rounded-full bg-border" />
                                <AlertCircle className="h-3 w-3" />
                                Overdue
                            </span>
                        )}

                        {complaint.deadline && !isOverdue && (
                            <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="h-1 w-1 rounded-full bg-border" />
                                <CalendarClock className="h-3 w-3" />
                                Due {complaint.deadline.toLocaleString()}
                            </span>
                        )}

                        <span className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                            {complaint.media.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <Paperclip className="h-3 w-3" />
                                    {complaint.media.length}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {complaint._count.commentList}
                            </span>
                            <span className="flex items-center gap-1">
                                <ChevronUp className="h-3 w-3" />
                                {complaint.upvotesCount}
                            </span>
                            <span className="text-muted-foreground/50">
                                {formatDistanceToNowStrict(new Date(complaint.createdAt), { addSuffix: true })}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

// Empty state

function EmptyState({ role }: { role: "STUDENT" | "CARETAKER" }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
                <ClipboardList className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-foreground mb-2" >
                {role === "STUDENT" ? "No complaints yet" : "No assigned complaints"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                {role === "STUDENT"
                    ? "You haven't submitted any complaints. Raise an issue and we'll get it sorted."
                    : "You have no complaints assigned to you at the moment."}
            </p>
            {role === "STUDENT" && (
                <Button asChild size="sm" className="mt-6">
                    <Link href="/complaints/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Submit a complaint
                    </Link>
                </Button>
            )}
        </div>
    )
}

//  Page
export default async function MyComplaintsPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/sign-in")

    const role = session.user.role as "STUDENT" | "CARETAKER" | "SUPERVISOR"

    // Supervisors don't have a "my" page
    if (role === "SUPERVISOR") redirect("/complaints")

    const isStudent = role === "STUDENT"

    // STUDENT:
    const STUDENT_COMPLAINTS = await prisma.complaint.findMany({
        where: { userId: session.user.id },
        include: {
            assignedTo: { select: { name: true } },
            _count: { select: { commentList: true, resolutions: true } },
        },
        orderBy: { createdAt: "desc" },
    })

    // CARETAKER:
    const CARETAKER_COMPLAINTS = await prisma.complaint.findMany({
        where: { assignedToId: session.user.id },
        include: {
            user: { select: { name: true, email: true } },
            _count: { select: { commentList: true, resolutions: true } },
        },
        orderBy: { createdAt: "desc" },
    })

    const complaints = isStudent ? STUDENT_COMPLAINTS : CARETAKER_COMPLAINTS

    // Computed stats
    const total = complaints.length
    const pending = complaints.filter((c) => c.status === "PENDING").length
    const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS").length
    const resolved = complaints.filter((c) => c.status === "RESOLVED").length
    const totalUpvotes = complaints.reduce((sum, c) => sum + c.upvotesCount, 0)
    const overdue = complaints.filter((complaint) => complaint.isEscalated === true).length

    // Group by status for sections
    const sections: { label: string; status: Status; icon: React.ElementType; iconClass: string }[] = [
        { label: "In Progress", status: "IN_PROGRESS", icon: Loader2, iconClass: "text-blue-500" },
        { label: "Pending", status: "PENDING", icon: Clock, iconClass: "text-amber-500" },
        { label: "Resolved", status: "RESOLVED", icon: CheckCircle2, iconClass: "text-emerald-500" },
        { label: "Closed", status: "CLOSED", icon: XCircle, iconClass: "text-muted-foreground" },
    ]

    const userName = session.user.name?.split(" ")[0] ?? "there"

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">

                {/* Profile header */}
                <div className="bg-card border border-border rounded-2xl p-6 mb-6 relative overflow-hidden">
                    {/* Subtle background glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 border-2 border-border">
                                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary" >
                                    {session.user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h1 className="text-xl font-bold text-foreground" >
                                        Hey, {userName}
                                    </h1>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${isStudent
                                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                        }`}>
                                        {role}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{session.user.email}</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                    {isStudent
                                        ? `${total} complaint${total !== 1 ? "s" : ""} submitted`
                                        : `${total} complaint${total !== 1 ? "s" : ""} assigned to you`}
                                </p>
                            </div>
                        </div>

                        {isStudent && (
                            <Button asChild size="sm" className="shrink-0 self-start sm:self-center">
                                <Link href="/complaints/new" className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    New complaint
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <StatCard
                        label="Total"
                        value={total}
                        icon={ClipboardList}
                        iconClass="text-primary"
                        iconBg="bg-primary/10"
                    />
                    <StatCard
                        label="In Progress"
                        value={inProgress}
                        icon={Loader2}
                        iconClass="text-blue-500"
                        iconBg="bg-blue-500/10"
                        sub={pending > 0 ? `${pending} pending` : undefined}
                    />
                    <StatCard
                        label="Resolved"
                        value={resolved}
                        icon={CheckCircle2}
                        iconClass="text-emerald-500"
                        iconBg="bg-emerald-500/10"
                    />
                    {isStudent ? (
                        <StatCard
                            label="Total Upvotes"
                            value={totalUpvotes}
                            icon={Star}
                            iconClass="text-amber-500"
                            iconBg="bg-amber-500/10"
                        />
                    ) : (
                        <StatCard
                            label={overdue > 0 ? "Overdue" : "On Track"}
                            value={overdue > 0 ? overdue : "✓"}
                            icon={overdue > 0 ? AlertCircle : TrendingUp}
                            iconClass={overdue > 0 ? "text-red-500" : "text-emerald-500"}
                            iconBg={overdue > 0 ? "bg-red-500/10" : "bg-emerald-500/10"}
                        />
                    )}
                </div>

                {/* Complaint sections */}
                {total === 0 ? (
                    <div className="bg-card border border-border rounded-2xl">
                        <EmptyState role={role} />
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        {sections.map((section, si) => {
                            const sectionComplaints = complaints.filter((c) => c.status === section.status)
                            if (sectionComplaints.length === 0) return null
                            const SectionIcon = section.icon

                            return (
                                <div key={section.status}>
                                    {si > 0 && <Separator />}
                                    {/* Section header */}
                                    <div className="flex items-center gap-2 px-5 py-3 bg-muted/30">
                                        <SectionIcon className={`h-3.5 w-3.5 ${section.iconClass}`} />
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {section.label}
                                        </span>
                                        <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5">
                                            {sectionComplaints.length}
                                        </Badge>
                                    </div>

                                    {/* Rows */}
                                    <div className="divide-y divide-border/50">
                                        {sectionComplaints.map((complaint) => (
                                            <ComplaintRow
                                                key={complaint.id}
                                                complaint={complaint}
                                                viewerRole={role}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Footer note */}
                {total > 0 && (
                    <p className="text-center text-xs text-muted-foreground/50 mt-6">
                        {isStudent
                            ? "Showing all your submitted complaints"
                            : "Showing all complaints assigned to you"}
                    </p>
                )}
            </div>
        </main>
    )
}