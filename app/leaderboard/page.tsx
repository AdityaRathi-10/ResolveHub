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
    CardTitle }
from "@/components/ui/card"
import { Trophy, Medal, Award } from "lucide-react"

export default async function LeaderBoard() {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "SUPERVISOR") {
        throw new Error("Unauthorized")
    }

    const caretakers = await prisma.user.findMany({
        where: {
            role: "CARETAKER"
        },
        select: {
            _count: {
                select: {
                    complaints: true
                }
            },
            points: true,
            name: true,
        },
        orderBy: {
            points: "desc"
        }
    })

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500 mx-auto" />
        if (index === 1) return <Medal className="h-5 w-5 text-gray-400 mx-auto" />
        if (index === 2) return <Award className="h-5 w-5 text-amber-700 mx-auto" />
        return `#${index + 1}`
    }

    return (
        <div className="flex justify-center mt-10 px-4">
            <Card className="w-full max-w-4xl shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">
                        Leaderboard
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {caretakers.length === 0 ? (
                        <p className="text-center text-muted-foreground">
                            No caretakers found.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader className="text-lg">
                                <TableRow>
                                    <TableHead className="text-center">Rank</TableHead>
                                    <TableHead className="text-center">Name</TableHead>
                                    <TableHead className="text-center">
                                        Complaints Resolved
                                    </TableHead>
                                    <TableHead className="text-center">Points</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {caretakers.map((caretaker, index) => (
                                    <TableRow
                                        key={index}
                                        className="hover:bg-muted/50 transition"
                                    >
                                        <TableCell className="text-center font-medium">
                                            {getRankIcon(index)}
                                        </TableCell>

                                        <TableCell className="text-center">
                                            {caretaker.name}
                                        </TableCell>

                                        <TableCell className="text-center">
                                            {caretaker._count.complaints}
                                        </TableCell>

                                        <TableCell className="text-center font-semibold">
                                            {caretaker.points}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}