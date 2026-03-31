import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/options'
import { prisma } from '@/lib/prisma'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Trophy, Medal, Award, Star, TrendingUp, Users } from "lucide-react"

export default async function LeaderBoard() {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "SUPERVISOR") {
        throw new Error("Unauthorized")
    }

    const caretakers = await prisma.user.findMany({
        where: { role: "CARETAKER" },
        select: {
            _count: {
                select: {
                    assignedComplaints: {
                        where: { status: "RESOLVED" },
                    },
                    resolutions: true,
                },
            },
            points: true,
            name: true,
            email: true,
        },
        orderBy: { points: "desc" },
    })

    // Derived values

    const totalResolved = caretakers.reduce((sum, c) => sum + c._count.assignedComplaints, 0)
    const topScore = caretakers[0]?.points ?? 0

    const getEfficiency = (resolved: number, resolutions: number): number => {
        if (resolutions === 0) return 0
        return Math.min(Math.round((resolved / resolutions) * 100), 100)
    }

    const getEfficiencyBadge = (pct: number) => {
        if (pct >= 80) return { label: `${pct}%`, class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" }
        if (pct >= 50) return { label: `${pct}%`, class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" }
        if (pct === 0) return { label: "—", class: "bg-muted text-muted-foreground border-border" }
        return { label: `${pct}%`, class: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" }
    }

    const getPodiumConfig = (index: number) => {
        if (index === 0) return {
            icon: Trophy,
            iconClass: "text-yellow-500",
            iconBg: "bg-yellow-500/10 border-yellow-500/20",
            rowClass: "bg-gradient-to-r from-yellow-500/[0.04] to-transparent",
            leftBorder: "border-l-2 border-yellow-500/50",
            pointsClass: "text-yellow-500",
            barClass: "bg-yellow-500",
        }
        if (index === 1) return {
            icon: Medal,
            iconClass: "text-slate-400",
            iconBg: "bg-slate-400/10 border-slate-400/20",
            rowClass: "bg-gradient-to-r from-slate-400/[0.04] to-transparent",
            leftBorder: "border-l-2 border-slate-400/40",
            pointsClass: "text-slate-400",
            barClass: "bg-slate-400",
        }
        if (index === 2) return {
            icon: Award,
            iconClass: "text-amber-600",
            iconBg: "bg-amber-600/10 border-amber-600/20",
            rowClass: "bg-gradient-to-r from-amber-600/[0.04] to-transparent",
            leftBorder: "border-l-2 border-amber-600/40",
            pointsClass: "text-amber-600",
            barClass: "bg-amber-600",
        }
        return {
            icon: null,
            iconClass: "",
            iconBg: "",
            rowClass: "",
            leftBorder: "",
            pointsClass: "text-foreground",
            barClass: "bg-primary/40",
        }
    }

    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">

                {/* Page header */}
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                        <h1
                            className="text-2xl font-bold text-foreground leading-tight"
                            style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                            Leaderboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Caretaker performance ranked by points
                        </p>
                    </div>
                </div>

                {/* Summary stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Caretakers", value: caretakers.length, icon: Users, iconClass: "text-primary", bg: "bg-primary/10" },
                        { label: "Total resolved", value: totalResolved, icon: TrendingUp, iconClass: "text-emerald-500", bg: "bg-emerald-500/10" },
                        { label: "Top score", value: topScore.toLocaleString(), icon: Star, iconClass: "text-yellow-500", bg: "bg-yellow-500/10" },
                        { label: "Top score", value: topScore.toLocaleString(), icon: Star, iconClass: "text-yellow-500", bg: "bg-yellow-500/10" },
                    ].map(({ label, value, icon: Icon, iconClass, bg }) => (
                        <Card key={label} className="rounded-xl border border-border shadow-none">
                            <CardContent className="px-4 py-3 flex items-center gap-3">
                                <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                                    <Icon className={`h-4 w-4 ${iconClass}`} />
                                </div>
                                <div className="min-w-0">
                                    <p
                                        className="text-xl font-bold text-foreground leading-none tabular-nums"
                                        style={{ fontFamily: "'Sora', sans-serif" }}
                                    >
                                        {value}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Rankings table */}
                <Card className="rounded-2xl border border-border shadow-none overflow-hidden p-0">
                    <CardHeader className="px-6 py-4 border-b border-border bg-muted/20">
                        <CardTitle
                            className="text-sm font-semibold text-foreground"
                            style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                            Rankings
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        {caretakers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                    <Trophy className="h-6 w-6 text-muted-foreground/30" />
                                </div>
                                <p className="text-sm font-medium text-foreground mb-1">No caretakers yet</p>
                                <p className="text-xs text-muted-foreground">
                                    Rankings will appear once caretakers resolve complaints.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/10 hover:bg-muted/10 border-border">
                                        <TableHead className="w-14 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">
                                            Rank
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">
                                            Caretaker
                                        </TableHead>
                                        <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">
                                            Resolved
                                        </TableHead>
                                        <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">
                                            Attempts
                                        </TableHead>
                                        <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">
                                            Efficiency
                                        </TableHead>
                                        <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">
                                            Points
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {caretakers.map((caretaker, index) => {
                                        const podium = getPodiumConfig(index)
                                        const PodiumIcon = podium.icon
                                        const pointsPct = topScore > 0 ? (caretaker.points / topScore) * 100 : 0
                                        const efficiency = getEfficiency(
                                            caretaker._count.assignedComplaints,
                                            caretaker._count.resolutions
                                        )
                                        const effBadge = getEfficiencyBadge(efficiency)

                                        return (
                                            <TableRow
                                                key={caretaker.email}
                                                className={`transition-colors hover:bg-muted/30 border-border ${podium.rowClass} ${podium.leftBorder}`}
                                            >
                                                {/* Rank */}
                                                <TableCell className="text-center py-4">
                                                    {PodiumIcon ? (
                                                        <div className={`h-7 w-7 rounded-lg border flex items-center justify-center mx-auto ${podium.iconBg}`}>
                                                            <PodiumIcon className={`h-3.5 w-3.5 ${podium.iconClass}`} />
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm font-medium text-muted-foreground tabular-nums">
                                                            #{index + 1}
                                                        </span>
                                                    )}
                                                </TableCell>

                                                {/* Name + points progress bar */}
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                                                            <span className="text-[10px] font-bold text-muted-foreground">
                                                                {getInitials(caretaker.name)}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium text-foreground truncate">
                                                                {caretaker.name}
                                                            </p>
                                                            <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden w-full max-w-40">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${podium.barClass}`}
                                                                    style={{ width: `${pointsPct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Complaints resolved */}
                                                <TableCell className="text-center py-4">
                                                    <span className="text-sm tabular-nums font-medium text-foreground">
                                                        {caretaker._count.assignedComplaints}
                                                    </span>
                                                </TableCell>

                                                {/* Resolution attempts */}
                                                <TableCell className="text-center py-4">
                                                    <span className="text-sm tabular-nums text-muted-foreground">
                                                        {caretaker._count.resolutions}
                                                    </span>
                                                </TableCell>

                                                {/* Efficiency badge */}
                                                <TableCell className="text-center py-4">
                                                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${effBadge.class}`}>
                                                        {effBadge.label}
                                                    </span>
                                                </TableCell>

                                                {/* Points */}
                                                <TableCell className="text-center py-4">
                                                    <span className={`text-sm font-bold tabular-nums ${podium.pointsClass}`}>
                                                        {caretaker.points.toLocaleString()}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground/50">
                    Points are awarded when resolutions are approved by students
                </p>
            </div>
        </main>
    )
}