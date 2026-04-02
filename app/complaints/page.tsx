import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { redirect } from "next/navigation"
import { ComplaintCard } from "@/components/ComplaintCard"
import { Plus, SlidersHorizontal, Clock, CheckCircle2, Loader2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { prisma } from "@/lib/prisma"
import Filters from "@/components/Filters"

interface ComplaintsPageProps {
    searchParams: Promise<{
        status?: string
        priority?: string
        sort?: string
    }>
}

function StatPill({
    label,
    count,
    icon: Icon,
    color,
}: {
    label: string
    count: number
    icon: React.ElementType
    color: string
}) {
    return (
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-xl px-4 py-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-lg font-bold text-foreground leading-none" >
                    {count}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
        </div>
    )
}

export default async function ComplaintsPage({ searchParams }: ComplaintsPageProps) {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/sign-in")

    const { status, priority, sort } = await searchParams
    const activeStatus = status ?? "all"

    const role = session.user.role as "STUDENT" | "CARETAKER" | "SUPERVISOR"
    const where: any = {}

    if (status && status !== "All" && status !== "escalated") {
        where.status = status.replaceAll(" ", "_").toUpperCase()
    }

    if(status === "escalated") {
        if(session.user.role !== "SUPERVISOR") {
            redirect("/complaints")
        }
        where.isEscalated = true
    }

    if (priority && priority !== "All") {
        where.priority = priority.toUpperCase()
    }

    const orderBy: any = {}

    if (sort === "newest") orderBy.createdAt = "desc"
    else if (sort === "oldest") orderBy.createdAt = "asc"
    else if (sort === "upvotes") orderBy.upvotes = "desc"
    else orderBy.createdAt = "desc"

    const complaints = await prisma.complaint.findMany({
        where,
        orderBy,
        include: {
            user: true,
            assignedTo: true,
            _count: {
                select: {
                    commentList: true,
                    resolutions: true,
                },
            },
        },
    })

    const stat = activeStatus !== "all" ? activeStatus?.replaceAll(" ", "_").toUpperCase() : null
    const filterComplaints = complaints.filter((complaint) => {
        if (activeStatus === "all") {
            return complaint.status !== "CLOSED"
        }
        if (activeStatus === "closed") {
            return complaint.status === "CLOSED"
        }
        return complaint.status === stat
    })

    const stats = {
        total: complaints.length,
        pending: complaints.filter((c) => c.status === "PENDING").length,
        inProgress: complaints.filter((c) => c.status === "IN_PROGRESS").length,
        resolved: complaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length,
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Complaints
                        </h1>
                    </div>

                    {role === "STUDENT" && (
                        <Button asChild size="sm" className="shrink-0">
                            <Link href="/complaints/new" className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                New complaint
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <StatPill label="Total" count={stats.total} icon={SlidersHorizontal} color="bg-primary/10 text-primary" />
                    <StatPill label="Pending" count={stats.pending} icon={Clock} color="bg-amber-500/10 text-amber-500" />
                    <StatPill label="In Progress" count={stats.inProgress} icon={Loader2} color="bg-blue-500/10 text-blue-500" />
                    <StatPill label="Resolved" count={stats.resolved} icon={CheckCircle2} color="bg-emerald-500/10 text-emerald-500" />
                </div>

                {/* Filters */}
                <Filters activeStatus={activeStatus} />

                {/* Count */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{filterComplaints.length}</span> complaints
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {stats.inProgress} being worked on
                    </div>
                </div>

                {/* Grid */}
                {filterComplaints.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filterComplaints.map((complaint) => (
                            <ComplaintCard key={complaint.id} complaint={complaint} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1" >
                            No complaints found
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            No complaints match your current filters.
                        </p>
                    </div>
                )}
            </div>
        </main>
    )
}