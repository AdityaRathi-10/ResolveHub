"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ShieldCheck, ImagePlus, X, Loader2, AlertCircle } from "lucide-react"
import { Label } from "./ui/label"
import Image from "next/image"
import { submitResolutionAction } from "@/app/complaints/[id]/actions/resolution.actions"

function ResolutionModal({
    onClose,
    complaintId,
    caretakerId
}: {
    onClose: () => void,
    complaintId: string,
    caretakerId: string | null
}) {
    const [description, setDescription] = useState("")
    const [mediaUrls, setMediaUrls] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    const canSubmit = description.trim().length > 0 || mediaUrls.length > 0

    // Lock body scroll while open
    useEffect(() => {
        document.body.style.overflow = "hidden"
        return () => { document.body.style.overflow = "" }
    }, [])

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isSubmitting) onClose()
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [isSubmitting, onClose])

    const handleSubmit = async () => {
        if (!canSubmit) {
            setError("Please add a description or at least one attachment as proof.")
            return
        }
        setIsSubmitting(true)
        setError("")
        try {
            if (!caretakerId) throw new Error("Unauthorized")
            const trimmedDescription = description.trim()
            const response = await submitResolutionAction(
                caretakerId,
                complaintId,
                trimmedDescription,
                mediaUrls,
            )
            console.log("Res", response)
            onClose()
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const removeMedia = (url: string) =>
        setMediaUrls((prev) => prev.filter((u) => u !== url))

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={() => !isSubmitting && onClose()}
            />

            {/* Modal card — centered, above backdrop */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="pointer-events-auto w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-foreground leading-snug">
                                    Submit Resolution Proof
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Provide a description, media evidence, or both.
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => !isSubmitting && onClose()}
                            variant="outline"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                        {/* Description */}
                        <div>
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                                What was done?
                            </Label>
                            <Textarea
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value)
                                    if (error) setError("")
                                }}
                                placeholder="Describe the resolution..."
                                rows={4}
                                className="resize-none text-sm rounded-xl bg-muted/30 border-border focus-visible:ring-1 focus-visible:ring-primary/30"
                            />
                        </div>

                        {/* Media */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Attachments
                                </Label>
                                <span className="text-xs text-muted-foreground/60">Optional</span>
                            </div>

                            {/* Thumbnails */}
                            {mediaUrls.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {mediaUrls.map((url) => (
                                        <div
                                            key={url}
                                            className="group relative w-full aspect-square rounded-xl overflow-hidden border border-border bg-muted"
                                        >
                                            <Image
                                                src={url}
                                                alt="Attachment"
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeMedia(url)}
                                                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/90 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Cloudinary widget */}
                            <CldUploadWidget
                                uploadPreset="resolveit"
                                options={{
                                    folder: "resolvehub/resolutions",
                                    resourceType: "auto",
                                    multiple: true,
                                }}
                                onSuccess={(result: CloudinaryUploadWidgetResults) => {
                                    if (typeof result.info === "object" && result.info !== null) {
                                        const url = result.info.secure_url
                                        setMediaUrls((prev) => [...prev, url])
                                    }
                                }}
                                onQueuesEnd={(_, { widget }) => widget.close()}
                            >
                                {({ open: openWidget }) => (
                                    <button
                                        type="button"
                                        onClick={() => openWidget()}
                                        className="w-full flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-200 py-5 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 group"
                                    >
                                        <ImagePlus className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-sm font-medium">
                                            {mediaUrls.length > 0 ? "Add more files" : "Upload photos or documents"}
                                        </span>
                                        <span className="text-xs opacity-50">
                                            Photos, screenshots, PDFs
                                        </span>
                                    </button>
                                )}
                            </CldUploadWidget>
                        </div>

                        {/* Error */}
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
                            onClick={() => !isSubmitting && onClose()}
                            disabled={isSubmitting}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!canSubmit || isSubmitting}
                            className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <ShieldCheck className="h-4 w-4" />
                            )}
                            {isSubmitting ? "Submitting…" : "Submit resolution"}
                        </Button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    )
}

// Public component

interface MarkAsResolvedProps {
    complaintId: string
    resolutionStatus: string | null
    complaintStatus: string
    assignedToId: string | null
    currentUserId: string
}

export default function MarkAsResolved({
    complaintId,
    resolutionStatus,
    complaintStatus,
    assignedToId,
    currentUserId,
}: MarkAsResolvedProps) {
    const [open, setOpen] = useState(false)

    const isCaretaker = currentUserId === assignedToId

    const canMarkResolved =
        isCaretaker &&
        (complaintStatus === "IN_PROGRESS" ||
            resolutionStatus !== "APPROVED")

    return (
        <>
            {canMarkResolved && (
                <Button
                    onClick={() => setOpen(true)}
                    className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                >
                    Mark as Resolved
                </Button>
            )}

            {open && (
                <ResolutionModal
                    onClose={() => setOpen(false)}
                    complaintId={complaintId}
                    caretakerId={assignedToId}
                />
            )}
        </>
    )
}