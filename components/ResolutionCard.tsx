"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { MediaGallery } from "@/components/MediaGallery"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Clock,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Loader2,
    AlertCircle,
    ThumbsUp,
    ThumbsDown,
} from "lucide-react"
import { formatDistanceToNowStrict } from "date-fns"
import { approveResolution, disapproveResolution } from "@/app/complaints/[id]/action"

// ─── Types ────────────────────────────────────────────────────────────────────

type ResolutionStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface ResolutionCardProps {
    resolution: {
        id: string
        description?: string | null
        media: string[]
        status: ResolutionStatus
        rejectionReason?: string | null
        rejectedAt?: Date | null
        createdAt: Date
        caretaker: { name: string; email: string }
    }
    attemptIndex: number
    total: number
    canReview?: boolean
    complaintId: string
    studentId: string | null
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    ResolutionStatus,
    {
        label: string
        icon: React.ElementType
        iconClass: string
        badgeClass: string
        borderAccent: string
        dot: string
    }
> = {
    PENDING: {
        label: "Awaiting Review",
        icon: Clock,
        iconClass: "text-amber-500",
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        borderAccent: "border-amber-500/30",
        dot: "bg-amber-500",
    },
    APPROVED: {
        label: "Approved",
        icon: CheckCircle2,
        iconClass: "text-emerald-500",
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        borderAccent: "border-emerald-500/30",
        dot: "bg-emerald-500",
    },
    REJECTED: {
        label: "Rejected",
        icon: XCircle,
        iconClass: "text-red-500",
        badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        borderAccent: "border-red-500/30",
        dot: "bg-red-500",
    },
}

// ─── Disapprove modal ─────────────────────────────────────────────────────────

function DisapproveModal({
    complaintId,
    studentId,
    resolutionId,
    onClose,
    onDisapproving,
    onDisapproveComplete,
}: {
    complaintId: string
    studentId: string | null
    resolutionId: string
    onClose: () => void
    onDisapproving: (val: boolean) => void
    onDisapproveComplete: () => void
}) {
    const [reason, setReason] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    const canSubmit = reason.trim().length > 0

    const handleCancel = () => {
        if (!isSubmitting) {
            onClose()
        }
    }

    const handleSubmit = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!canSubmit || !studentId) {
            setError("Please explain why the resolution is unsatisfactory.")
            return
        }

        setIsSubmitting(true)
        setError("")
        onDisapproving(true)

        try {
            const response = await disapproveResolution(
                complaintId,
                studentId,
                resolutionId,
                reason.trim()
            )
            if (response.success) {
                // Success: keep modal open, button stays loading, modal stays locked.
                onDisapproveComplete()
                // DO NOT call onClose() – modal remains open until page revalidates.
            } else {
                setError("Something went wrong. Please try again.")
                onDisapproving(false)
                setIsSubmitting(false)
            }
        } catch {
            setError("Something went wrong. Please try again.")
            onDisapproving(false)
            setIsSubmitting(false)
        }
    }

    return createPortal(
        <>
            {/* Backdrop — locked when submitting */}
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={handleCancel}
                style={{ pointerEvents: isSubmitting ? "none" : "auto" }}
            />
            {/* Modal card */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="pointer-events-auto w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border">
                        <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                            <ThumbsDown className="h-4.5 w-4.5 text-red-500" />
                        </div>
                        <div>
                            <h2
                                className="text-base font-semibold text-foreground"
                                style={{ fontFamily: "'Sora', sans-serif" }}
                            >
                                Disapprove Resolution
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                The complaint returns to{" "}
                                <strong className="text-foreground">In Progress</strong>.
                                The caretaker will see your reason.
                            </p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-3">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                            Why is this not resolved?
                        </label>
                        <Textarea
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value)
                                if (error) setError("")
                            }}
                            placeholder="The issue still persists because…"
                            rows={4}
                            disabled={isSubmitting}
                            autoFocus
                            className="resize-none text-sm rounded-xl bg-muted/30 border-border focus-visible:ring-1 focus-visible:ring-primary/30 disabled:opacity-60"
                        />
                        {error && (
                            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
                        <Button
                            variant="ghost"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!canSubmit || isSubmitting}
                            variant="destructive"
                            className="rounded-xl gap-2 min-w-32.5"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Disapproving…
                                </>
                            ) : (
                                <>
                                    <ThumbsDown className="h-4 w-4" />
                                    Disapprove
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    )
}

// ─── ResolutionCard ───────────────────────────────────────────────────────────

export function ResolutionCard({
    resolution,
    attemptIndex,
    total,
    canReview = false,
    complaintId,
    studentId,
}: ResolutionCardProps) {
    const config = STATUS_CONFIG[resolution.status]
    const StatusIcon = config.icon
    const isLatest = total - attemptIndex + 1 === total

    const [action, setAction] = useState<"approve" | "disapprove" | "done" | null>(null)
    const [disapproveOpen, setDisapproveOpen] = useState(false)

    const isActing = action === "approve" || action === "disapprove"
    const isDone = action === "done"

    // Auto‑close the modal when the resolution is no longer PENDING (after revalidation)
    useEffect(() => {
        if (disapproveOpen && resolution.status !== "PENDING") {
            setDisapproveOpen(false)
            setAction(null) // reset action state as well
        }
    }, [disapproveOpen, resolution.status])

    const caretakerInitials = resolution.caretaker.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    const handleApprove = async () => {
        if (isActing || isDone || !studentId) return
        setAction("approve")
        try {
            const response = await approveResolution(complaintId, studentId, resolution.id)
            if (response.success) {
                setAction("done")
            } else {
                setAction(null)
            }
        } catch {
            setAction(null)
        }
    }

    const handleDisapproveOpen = () => {
        if (isActing || isDone) return
        setDisapproveOpen(true)
    }

    const handleDisapproveClose = () => {
        // Only close if not in the middle of submitting (action is not "disapprove")
        if (action !== "disapprove") {
            setDisapproveOpen(false)
        }
    }

    return (
        <>
            <Accordion
                type="single"
                collapsible
                defaultValue={isLatest ? "resolution" : undefined}
            >
                <AccordionItem
                    value="resolution"
                    className={`rounded-xl border overflow-hidden transition-shadow data-[state=open]:shadow-sm ${config.borderAccent}`}
                >
                    {/* ── Trigger ─────────────────────────────────────────── */}
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 transition-colors data-[state=open]:border-b data-[state=open]:border-border/60 [&>svg]:shrink-0">
                        <div className="flex items-center justify-between w-full mr-3 gap-3 min-w-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`h-2 w-2 rounded-full shrink-0 ${config.dot}`} />
                                <span className="text-xs font-semibold text-muted-foreground shrink-0 tabular-nums">
                                    #{total - attemptIndex + 1}
                                    
                                </span>
                                <span className="text-sm text-foreground truncate">
                                    {resolution.description
                                        ? resolution.description
                                        : <span className="text-muted-foreground/50 italic">No description</span>
                                    }
                                    {isLatest && total > 1 && (
                                        <span className="ml-1 font-normal text-muted-foreground/50">
                                            · latest
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                                <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
                                    <StatusIcon className={`h-3 w-3 ${config.iconClass}`} />
                                    {config.label}
                                </span>
                                <span className="text-xs text-muted-foreground/60">
                                    {formatDistanceToNowStrict(
                                        new Date(resolution.createdAt),
                                        { addSuffix: true }
                                    )}
                                </span>
                            </div>
                        </div>
                    </AccordionTrigger>

                    {/* ── Content ──────────────────────────────────────────── */}
                    <AccordionContent className="p-0 bg-card">
                        <div className="px-4 py-4 space-y-4">
                            {resolution.description ? (
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {resolution.description}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground/50 italic">
                                    No description provided.
                                </p>
                            )}
                            {resolution.media.length > 0 && (
                                <MediaGallery urls={resolution.media} />
                            )}
                            {resolution.status === "REJECTED" && resolution.rejectionReason && (
                                <div className="rounded-lg bg-red-500/5 border border-red-500/15 overflow-hidden">
                                    <div className="flex items-center justify-between px-3 py-2 bg-red-500/5 border-b border-red-500/10">
                                        <div className="flex gap-2 items-center">
                                            <MessageSquare className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                            <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                                                Student&apos;s disapproval reason
                                            </p>
                                        </div>
                                        {resolution.rejectedAt && (
                                            <span className="ml-auto text-xs text-red-400/60">
                                                {formatDistanceToNowStrict(
                                                    new Date(resolution.rejectedAt),
                                                    { addSuffix: true }
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <p className="px-3 py-3 text-xs text-foreground/70 leading-relaxed">
                                        {resolution.rejectionReason}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border/60 bg-muted/10">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-semibold text-muted-foreground">
                                        {caretakerInitials}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {resolution.caretaker.name}
                                </span>
                            </div>

                            {canReview && resolution.status === "PENDING" && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleDisapproveOpen}
                                        disabled={isActing || isDone}
                                        className="rounded-xl h-8 px-3 text-xs gap-1.5 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 disabled:opacity-50 min-w-30"
                                    >
                                        {action === "disapprove" ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Disapproving…
                                            </>
                                        ) : (
                                            <>
                                                <ThumbsDown className="h-3.5 w-3.5" />
                                                Disapprove
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleApprove}
                                        disabled={isActing || isDone}
                                        className="rounded-xl h-8 px-3 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 min-w-25"
                                    >
                                        {action === "approve" || isDone ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Approving…
                                            </>
                                        ) : (
                                            <>
                                                <ThumbsUp className="h-3.5 w-3.5" />
                                                Approve
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {disapproveOpen && (
                <DisapproveModal
                    complaintId={complaintId}
                    studentId={studentId}
                    resolutionId={resolution.id}
                    onClose={handleDisapproveClose}
                    onDisapproving={(val) => setAction(val ? "disapprove" : null)}
                    onDisapproveComplete={() => setAction("done")}
                />
            )}
        </>
    )
}