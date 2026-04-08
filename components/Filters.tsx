"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useSession } from "next-auth/react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useEffect, useState } from "react"
import { useDebounceValue } from "usehooks-ts"
import { CalendarIcon, Search, X } from "lucide-react"
import { format, isValid, parseISO } from "date-fns"
import type { DateRange } from "react-day-picker"

export default function Filters({ activeStatus }: { activeStatus: string }) {
    const [searchInput, setSearchInput] = useState("")
    const [debouncedSearchInput] = useDebounceValue(searchInput, 300)
    const [calendarOpen, setCalendarOpen] = useState(false)

    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()

    // Restore date state from URL on mount
    const dateFromParam = searchParams.get("date_from")
    const dateToParam = searchParams.get("date_to")

    const parsedFrom = dateFromParam && isValid(parseISO(dateFromParam)) ? parseISO(dateFromParam) : undefined
    const parsedTo = dateToParam && isValid(parseISO(dateToParam)) ? parseISO(dateToParam) : undefined

    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        parsedFrom ? { from: parsedFrom, to: parsedTo } : undefined
    )

    // Search debounce
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        const current = params.get("search_query") || ""
        if (current === debouncedSearchInput) return
        if (!debouncedSearchInput) params.delete("search_query")
        else params.set("search_query", debouncedSearchInput)
        router.push(`/complaints?${params.toString()}`)
    }, [debouncedSearchInput])

    // Helpers
    function updateParam(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value === "all") params.delete(key)
        else params.set(key, value)
        router.push(`/complaints?${params.toString()}`)
    }

    function applyDateRange(range: DateRange | undefined) {
        const params = new URLSearchParams(searchParams.toString())
        if (range?.from) {
            params.set("date_from", format(range.from, "yyyy-MM-dd"))
            if (range.to) params.set("date_to", format(range.to, "yyyy-MM-dd"))
            else params.delete("date_to")
        } else {
            params.delete("date_from")
            params.delete("date_to")
        }
        router.push(`/complaints?${params.toString()}`)
    }

    function clearDateRange() {
        setDateRange(undefined)
        const params = new URLSearchParams(searchParams.toString())
        params.delete("date_from")
        params.delete("date_to")
        router.push(`/complaints?${params.toString()}`)
    }

    // Date button label
    const hasDate = !!dateRange?.from
    let dateLabel = "Pick date"
    if (dateRange?.from && dateRange?.to) {
        dateLabel = `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d")}`
    } else if (dateRange?.from) {
        dateLabel = format(dateRange.from, "MMM d, yyyy")
    }

    const baseTabs = [
        { label: "All", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "In Progress", value: "in progress" },
        { label: "Resolved", value: "resolved" },
        { label: "Closed", value: "closed" },
    ]

    const tabs =
        session?.user.role === "SUPERVISOR"
            ? [...baseTabs, { label: "Escalated", value: "escalated" }]
            : baseTabs

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
            {/* Status tabs */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-xl border border-border flex-wrap">
                {tabs.map(({ label, value }) => (
                    <Button
                        variant="ghost"
                        key={value}
                        onClick={() => updateParam("status", value)}
                        className={`p-4 rounded-lg text-xs font-medium cursor-pointer ${
                            activeStatus === value
                                ? "bg-background text-foreground shadow-sm border border-border"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {label}
                    </Button>
                ))}
            </div>

            {/* Right-side controls */}
            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                {/* Search */}
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search complaints..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Date picker */}
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`h-9 gap-2 text-xs rounded-xl px-3 ${
                                hasDate
                                    ? "border-primary/50 bg-primary/5 text-primary hover:bg-primary/10"
                                    : "text-muted-foreground"
                            }`}
                        >
                            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden sm:inline">{dateLabel}</span>
                            <span className="sm:hidden">Date</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto p-0 rounded-xl shadow-lg border border-border"
                        align="end"
                        sideOffset={6}
                    >

                        <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={(range) => {
                                setDateRange(range)
                                // Auto-apply on single day select or when both ends are set
                                if (range?.from && range?.to) {
                                    applyDateRange(range)
                                    setCalendarOpen(false)
                                } else if (range?.from && !range?.to) {
                                    applyDateRange(range)
                                }
                            }}
                            numberOfMonths={1}
                            disabled={{ after: new Date() }}
                            autoFocus
                        />

                        {/* Footer — clear button */}
                        {hasDate && (
                            <div className="p-2 border-t border-border">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        clearDateRange()
                                        setCalendarOpen(false)
                                    }}
                                    className="w-full h-7 text-xs text-muted-foreground hover:text-destructive gap-1.5"
                                >
                                    <X className="h-3 w-3" />
                                    Clear date filter
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

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