"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const tabs = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in progress" },
    { label: "Resolved", value: "resolved" },
    { label: "Closed", value: "closed" }
]

export default function Filters({ activeStatus }: { activeStatus: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    function updateParam(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value === "all") {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        router.push(`/complaints?${params.toString()}`)
    }

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">

            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border flex-wrap">
                {tabs.map(({ label, value }) => (
                    <button
                        key={label}
                        onClick={() => updateParam("status", value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${activeStatus === value
                                ? "bg-background text-foreground shadow-sm border border-border"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Select Filters */}
            <div className="flex items-center gap-2 sm:ml-auto">
                {/* Priority */}
                <Select
                    onValueChange={(value) => updateParam("priority", value)}
                    defaultValue={searchParams.get("priority") ?? "all"}
                >
                    <SelectTrigger className="h-9 w-32.5 text-xs rounded-xl">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                </Select>

                {/* Sort */}
                <Select
                    onValueChange={(value) => updateParam("sort", value)}
                    defaultValue={searchParams.get("sort") ?? "all"}
                >
                    <SelectTrigger className="h-9 w-32.5 text-xs rounded-xl">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Sort by</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="upvotes">Most upvoted</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}