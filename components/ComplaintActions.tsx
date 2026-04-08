"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, Loader2, AlertCircle, EllipsisVertical } from "lucide-react"
import { deleteComplaint } from "@/app/complaints/[id]/actions/complaint.actions"
import { createPortal } from "react-dom"

const ICON_MAP = {
    "ellipsis-vertical": EllipsisVertical,
    "more-horizontal": MoreHorizontal
} as const

type IconName = keyof typeof ICON_MAP

interface ComplaintActionsProps {
    complaintId: string
    authorId: string
    canEdit: boolean
    size?: "xs" | "sm"
    icon?: IconName
}

function DeleteModal({
    complaintId,
    authorId,
    onClose,
}: {
    complaintId: string
    authorId: string
    onClose: () => void
}) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const response = await deleteComplaint(complaintId, authorId)
            if (response.success) {
                router.replace("/complaints")
            }
        } catch {
            setIsDeleting(false)
        }
    }

    return createPortal(
        <>
            {/* Backdrop — ignores clicks while deleting */}
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={() => !isDeleting && onClose()}
            />

            {/* Modal card */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="pointer-events-auto w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border">
                        <div className="h-9 w-9 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                            <AlertCircle className="h-4.5 w-4.5 text-destructive" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                Delete complaint?
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The complaint, all its comments, resolutions, and activity
                            will be permanently removed.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
                        <Button
                            variant="ghost"
                            onClick={() => !isDeleting && onClose()}
                            disabled={isDeleting}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded-xl gap-2 min-w-27.5"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Deleting…
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Delete
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
// Main component

export default function ComplaintActions({
    complaintId,
    authorId,
    canEdit,
    size = "sm",
    icon = "more-horizontal"
}: ComplaintActionsProps) {
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    const btnClass = size === "xs" ? "h-7 w-7 rounded-lg" : "h-8 w-8 rounded-lg"
    const Icon = ICON_MAP[icon]

    return (
        <>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`${btnClass} text-muted-foreground hover:text-foreground`}
                        // Prevent the Link wrapper on ComplaintCard from firing
                        onClick={(e) => e.preventDefault()}
                    >
                        <Icon className="h-4 w-4" />
                        <span className="sr-only">Complaint options</span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    sideOffset={4}
                    className="w-44 rounded-xl border border-border shadow-lg p-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Edit — shown but disabled when not PENDING */}
                    <DropdownMenuItem
                        asChild={canEdit}
                        disabled={!canEdit}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {canEdit ? (
                            <a href={`/complaints/${complaintId}/edit`}>
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                Edit
                            </a>
                        ) : (
                            <span className="flex items-center gap-2.5 opacity-50 cursor-not-allowed">
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>
                                    Edit
                                    <span className="block text-[10px] text-muted-foreground font-normal leading-none mt-0.5">
                                        Editable only in Pending state
                                    </span>
                                </span>
                            </span>
                        )}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem
                        variant="destructive"
                        onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            setMenuOpen(false)
                            setDeleteOpen(true)
                        }}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {deleteOpen && (
                <DeleteModal
                    complaintId={complaintId}
                    onClose={() => setDeleteOpen(false)}
                    authorId={authorId}
                />
            )}
        </>
    )
}