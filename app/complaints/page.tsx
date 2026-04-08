import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { redirect } from "next/navigation"
import { ComplaintCard } from "@/components/ComplaintCard"
import { Plus, SlidersHorizontal, Clock, CheckCircle2, Loader2, Layers2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { prisma } from "@/lib/prisma"
import Filters from "@/components/Filters"
import { parseISO, isValid, startOfDay, endOfDay } from "date-fns"

interface ComplaintsPageProps {
    searchParams: Promise<{
        status?: string
        priority?: string
        sort?: string
        search_query?: string
        date_from?: string
        date_to?: string
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
                <p className="text-lg font-bold text-foreground leading-none">
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

    const { status, priority, sort, search_query, date_from, date_to } = await searchParams
    const activeStatus = status ?? "all"

    const role = session.user.role as "STUDENT" | "CARETAKER" | "SUPERVISOR"

    // Fetch all complaints for stats
    const allComplaints = await prisma.complaint.findMany({
        include: {
            user: true,
            assignedTo: true,
            _count: {
                select: {
                    commentList: true,
                    resolutions: true,
                    upvotes: true,
                },
            },
        },
    })

    // Compute static stats (always based on full dataset, unaffected by filters)
    const stats = {
        total: allComplaints.length,
        pending: allComplaints.filter((c) => c.status === "PENDING").length,
        inProgress: allComplaints.filter((c) => c.status === "IN_PROGRESS").length,
        resolved: allComplaints.filter(
            (c) => c.status === "RESOLVED" || c.status === "CLOSED"
        ).length,
    }

    // Build filtered list
    let filteredComplaints = [...allComplaints]

    // Search
    if (search_query) {
        filteredComplaints = filteredComplaints.filter((c) =>
            c.title.toLowerCase().includes(search_query.toLowerCase())
        )
    }

    // Status filter
    if (!status || status === "all") {
        filteredComplaints = filteredComplaints.filter((c) => c.status !== "CLOSED")
    } else if (status === "escalated") {
        filteredComplaints = filteredComplaints.filter((c) => c.isEscalated)
    } else if (status === "closed") {
        filteredComplaints = filteredComplaints.filter((c) => c.status === "CLOSED")
    } else {
        filteredComplaints = filteredComplaints.filter(
            (c) => c.status === status.replaceAll(" ", "_").toUpperCase()
        )
    }

    // Priority filter
    if (priority && priority !== "all") {
        filteredComplaints = filteredComplaints.filter(
            (c) => c.priority === priority.toUpperCase()
        )
    }

    // Date filter 
    const parsedFrom = date_from && isValid(parseISO(date_from)) ? parseISO(date_from) : null
    const parsedTo = date_to && isValid(parseISO(date_to)) ? parseISO(date_to) : null

    if (parsedFrom) {
        const from = startOfDay(parsedFrom)
        const to = parsedTo ? endOfDay(parsedTo) : endOfDay(parsedFrom)

        if (!status || status === "all") {
            filteredComplaints = allComplaints.filter((c) => {
                if (search_query && !c.title.toLowerCase().includes(search_query.toLowerCase())) return false
                if (priority && priority !== "all" && c.priority !== priority.toUpperCase()) return false
                return c.createdAt >= from && c.createdAt <= to
            })
        } else {
            filteredComplaints = filteredComplaints.filter(
                (c) => c.createdAt >= from && c.createdAt <= to
            )
        }
    }

    // Sort
    if (sort === "newest")
        filteredComplaints.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    else if (sort === "oldest")
        filteredComplaints.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    else if (sort === "upvotes")
        filteredComplaints.sort((a, b) => b._count.upvotes - a._count.upvotes)

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
                        Showing{" "}
                        <span className="font-medium text-foreground">
                            {filteredComplaints.length}
                        </span>{" "}
                        complaints
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Layers2 className="h-3.5 w-3.5" />
                        {stats.inProgress} being worked on
                    </div>
                </div>

                {/* Grid */}
                {filteredComplaints.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredComplaints.map((complaint) => (
                            <ComplaintCard key={complaint.id} complaint={complaint} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">
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