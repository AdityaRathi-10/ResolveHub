import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { redirect } from "next/navigation"
import { ComplaintCard, ComplaintCardData } from "@/components/ComplaintCard"
import { Plus, SlidersHorizontal, Clock, CheckCircle2, Loader2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { prisma } from "@/lib/prisma"

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
                <p className="text-lg font-bold text-foreground leading-none" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {count}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
        </div>
    )
}

export default async function ComplaintsPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/sign-in")

    const role = session.user.role as "STUDENT" | "CARETAKER" | "SUPERVISOR"
    const complaints = await prisma.complaint.findMany()
    const complaintsWithUser = complaints.map((complaint) => {
        return { 
            ...complaint,
            user: { 
                name: session.user.name ?? "Unknown",
                email: session.user.email ?? "Unknown" 
            },
            commentList: [],
            resolutions: [],
        }
    })

    const stats = {
        total: complaints.length,
        pending: complaints.filter((c) => c.status === "PENDING").length,
        inProgress: complaints.filter((c) => c.status === "IN_PROGRESS").length,
        resolved: complaints.filter((c) => c.status === "RESOLVED").length,
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                        <h1
                            className="text-2xl font-bold text-foreground"
                            style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                            Complaints
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {role === "STUDENT"
                                ? "Your submitted complaints"
                                : role === "CARETAKER"
                                ? "Complaints assigned to you"
                                : "All complaints across the system"}
                        </p>
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
                    {/* Status tabs */}
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border flex-wrap">
                        {["All", "Pending", "In Progress", "Resolved", "Closed"].map((tab, i) => (
                            <button
                                key={tab}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                                    i === 0
                                        ? "bg-background text-foreground shadow-sm border border-border"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 sm:ml-auto">
                        <Select>
                            <SelectTrigger className="h-9 w-32.5 text-xs rounded-xl">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All priorities</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select>
                            <SelectTrigger className="h-9 w-32.5 text-xs rounded-xl">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest first</SelectItem>
                                <SelectItem value="oldest">Oldest first</SelectItem>
                                <SelectItem value="upvotes">Most upvoted</SelectItem>
                                <SelectItem value="priority">Priority</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Count */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{complaints.length}</span> complaints
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {stats.inProgress} being worked on
                    </div>
                </div>

                {/* Grid */}
                {complaintsWithUser.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {complaintsWithUser.map((complaint) => (
                            <ComplaintCard key={complaint.id} complaint={complaint} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
                            No complaints found
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            {role === "STUDENT"
                                ? "You haven't submitted any complaints yet."
                                : "No complaints match your current filters."}
                        </p>
                        {role === "STUDENT" && (
                            <Button asChild size="sm" className="mt-5">
                                <Link href="/complaints/new">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Submit your first complaint
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </main>
    )
}