"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useSession } from "next-auth/react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useEffect, useState } from "react"
import { useDebounceValue } from "usehooks-ts"
import { Search } from "lucide-react"

export default function Filters({ activeStatus }: { activeStatus: string }) {
    const [searchInput, setSearchInput] = useState("")
    const [debouncedSearchInput] = useDebounceValue(searchInput, 300)
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        const current = params.get("search_query") || ""
        if (current === debouncedSearchInput) return

        if (!debouncedSearchInput) {
            params.delete("search_query")
        }
        else {
            params.set("search_query", debouncedSearchInput)
        }
        router.push(`/complaints?${params.toString()}`)
    }, [debouncedSearchInput])

    function updateParam(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value === "all") {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        router.push(`/complaints?${params.toString()}`)
    }

    const baseTabs = [
        { label: "All", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "In Progress", value: "in progress" },
        { label: "Resolved", value: "resolved" },
        { label: "Closed", value: "closed" }
    ]

    const tabs = session?.user.role === "SUPERVISOR" ? [...baseTabs, { label: "Escalated", value: "escalated" }] : baseTabs

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-xl border border-border flex-wrap">
                {tabs.map(({ label, value }) => (
                    <Button
                        variant={"ghost"}
                        key={value}
                        onClick={() => updateParam("status", value)}
                        className={`p-4 rounded-lg text-xs font-medium cursor-pointer ${activeStatus === value
                            ? "bg-background text-foreground shadow-sm border border-border"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {label}
                    </Button>
                ))}
            </div>

            {/* Select Filters */}
            <div className="flex items-center gap-2 sm:ml-auto">
                {/* Search */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search complaints..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9"
                    />
                </div>

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