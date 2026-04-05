"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import {
    assignComplaint,
    closeComplaint,
    getComplaintAssignment,
    startWorkingOnComplaint,
    unassignComplaint,
} from '@/app/complaints/[id]/actions/complaint.actions'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

// Types
type ComplaintStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"

interface ComplaintActivityButtonProps {
    assigned: boolean
    complaintId: string
    assignedTo: string | null
    status: ComplaintStatus
    createdBy: string
}

// Component
export default function ComplaintActivityButton({
    assigned,
    complaintId,
    assignedTo,
    status,
    createdBy,
}: ComplaintActivityButtonProps) {
    const [isAssigned, setIsAssigned] = useState(assigned)
    const [currentAssignedTo, setCurrentAssignedTo] = useState<string | null>(assignedTo)
    const [currentStatus, setCurrentStatus] = useState<ComplaintStatus>(status)

    const [isAssigning, setIsAssigning] = useState(false)
    const [isUnassigning, setIsUnassigning] = useState(false)
    const [isStartingWork, setIsStartingWork] = useState(false)
    const [isClosing, setIsClosing] = useState(false)

    const { data: session } = useSession()

    const isMutating = useRef(false)
    useEffect(() => {
        isMutating.current = isAssigning || isUnassigning || isStartingWork || isClosing
    }, [isAssigning, isUnassigning, isStartingWork, isClosing])

    // Realtime subscription 
    useEffect(() => {
        const channel = supabase
            .channel(`complaint-activity-${complaintId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Complaint',
                    filter: `id=eq.${complaintId}`,
                },
                async () => {
                    if (isMutating.current) return

                    const { data: assignment } = await getComplaintAssignment(complaintId)
                    if (!assignment) return

                    setCurrentStatus(assignment.status as ComplaintStatus)

                    if (assignment.assignedTo) {
                        setIsAssigned(true)
                        setCurrentAssignedTo(assignment.assignedTo.id)
                    } else {
                        setIsAssigned(false)
                        setCurrentAssignedTo(null)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [complaintId])

    // Permission derivations 
    const viewerRole = session?.user.role
    const viewerId = session?.user.id

    const isComplaintOwner = viewerRole === "STUDENT" && viewerId === createdBy
    const isAssignedCaretaker = viewerRole === "CARETAKER" && viewerId === currentAssignedTo

    const canClose =
        currentStatus === "RESOLVED" &&
        (isComplaintOwner || isAssignedCaretaker)

    const canUnassign =
        isAssignedCaretaker &&
        currentStatus !== "RESOLVED" &&
        currentStatus !== "CLOSED"

    const canStartWork = isAssignedCaretaker && currentStatus === "PENDING"

    // Action handlers

    const handleAssign = async () => {
        setIsAssigning(true)
        try {
            const response = await assignComplaint(complaintId)
            if (response.success) {
                setIsAssigned(true)
                setCurrentAssignedTo(viewerId ?? null)
            }
        } catch (error) {
            console.error("Assign failed:", error)
        } finally {
            setIsAssigning(false)
        }
    }

    const handleUnassign = async () => {
        setIsUnassigning(true)
        try {
            const response = await unassignComplaint(complaintId)
            if (response.success) {
                setIsAssigned(false)
                setCurrentAssignedTo(null)
                setCurrentStatus("PENDING")
            }
        } catch (error) {
            console.error("Unassign failed:", error)
        } finally {
            setIsUnassigning(false)
        }
    }

    const handleStartWork = async () => {
        setIsStartingWork(true)
        try {
            const response = await startWorkingOnComplaint(complaintId)
            if (response.success) {
                setCurrentStatus("IN_PROGRESS")
            }
        } catch (error) {
            console.error("Start work failed:", error)
        } finally {
            setIsStartingWork(false)
        }
    }

    const handleClose = async () => {
        if (!viewerId) return
        setIsClosing(true)
        try {
            const response = await closeComplaint(complaintId, viewerId)
            if (response.success) {
                setCurrentStatus("CLOSED")
            }
        } catch (error) {
            console.error("Close failed:", error)
        } finally {
            setIsClosing(false)
        }
    }

    if (!session?.user) return null
    if (currentStatus === "CLOSED") return null

    if (isComplaintOwner) {
        if (!canClose) return null
        return (
            <Button
                onClick={handleClose}
                disabled={isClosing}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
                {isClosing ? (
                    <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Closing…
                    </>
                ) : (
                    "Close complaint"
                )}
            </Button>
        )
    }

    if (!isAssigned) {
        return (
            <Button onClick={handleAssign} disabled={isAssigning} className="gap-2">
                {isAssigning ? (
                    <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Assigning…
                    </>
                ) : (
                    "Assign to me"
                )}
            </Button>
        )
    }

    if (!isAssignedCaretaker) {
        return (
            <Button disabled>
                Assigned
            </Button>
        )
    }

    return (
        <div className="flex items-center gap-2">
            {/* Close — only when RESOLVED */}
            {canClose && (
                <Button
                    onClick={handleClose}
                    disabled={isClosing}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                    {isClosing ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Closing…
                        </>
                    ) : (
                        "Close complaint"
                    )}
                </Button>
            )}

            {/* Start work — only while still PENDING */}
            {canStartWork && (
                <Button onClick={handleStartWork} disabled={isStartingWork} className="gap-2">
                    {isStartingWork ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Starting…
                        </>
                    ) : (
                        "Start work"
                    )}
                </Button>
            )}

            {/* Unassign — while not yet resolved/closed */}
            {canUnassign && (
                <Button
                    onClick={handleUnassign}
                    disabled={isUnassigning}
                    className="gap-2"
                >
                    {isUnassigning ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Unassigning…
                        </>
                    ) : (
                        "Unassign"
                    )}
                </Button>
            )}
        </div>
    )
}