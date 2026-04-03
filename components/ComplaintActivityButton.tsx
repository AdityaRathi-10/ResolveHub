"use client"

import React, { useState } from 'react'
import { Button } from './ui/button'
import { assignComplaint, closeComplaint, startWorkingOnComplaint, unassignComplaint } from '@/app/complaints/[id]/actions/complaint.actions'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

interface AssignComplaintProps {
    assigned: boolean
    complaintId: string
    assignedTo: string | null
    status: string,
    createdBy: string
}

export default function ComplaintActivityButton({ assigned, complaintId, assignedTo, status, createdBy }: AssignComplaintProps) {
    const [isAssigned, setIsAssigned] = useState(assigned)
    const [currentAssignedTo, setCurrentAssignedTo] = useState(assignedTo)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isClosed, setIsClosed] = useState(false)
    const { data: session } = useSession()

    const isCreatorOfComplaint = session?.user.role === "STUDENT" && session?.user.id === createdBy
    const isAssignedCaretakerOfComplaint = session?.user.role === "CARETAKER" && session.user.id === currentAssignedTo
    const allowUnassign = isAssignedCaretakerOfComplaint
    const allowClosing = isCreatorOfComplaint || (isAssignedCaretakerOfComplaint && status === "RESOLVED")

    const handleAssignComplaint = async () => {
        setIsSubmitting(true)
        try {
            const response = await assignComplaint(complaintId)
            if (response.success) {
                setIsAssigned(true)
                setCurrentAssignedTo(session?.user?.id ?? null)
            }
        } catch (error) {
            console.log("Error: ", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUnAssignComplaint = async () => {
        setIsSubmitting(true)
        try {
            const response = await unassignComplaint(complaintId)
            if (response.success) {
                setIsAssigned(false)
                setCurrentAssignedTo(null)
            }
        } catch (error) {
            console.log("Error: ", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleStartWorkOnComplaint = async () => {
        try {
            const response = await startWorkingOnComplaint(complaintId)
            console.log("re", response)
        } catch (error) {
            console.log("Error: ", error)
        }
    }

    const handleCloseComplaint = async () => {
        setIsSubmitting(true)
        try {
            const response = await closeComplaint(complaintId, session!.user.id)
            if (response.success) {
                setIsClosed(true)
            }
        } catch (error) {
            console.log("Error: ", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if(status === "loading") return null

    if ((isCreatorOfComplaint && status !== "RESOLVED") || status === "CLOSED") {
        return null
    }

    if (!isAssigned) {
        return (
            <Button
                disabled={isSubmitting}
                onClick={handleAssignComplaint}
            >
                Assign to me
            </Button>
        )
    }

    if (allowClosing) {
        return (
            <Button
                className="flex gap-2 bg-blue-600 hover:bg-blue-800 text-white shadow-sm cursor-pointer"
                disabled={isSubmitting || isClosed}
                onClick={handleCloseComplaint}
            >
                {(isSubmitting || isClosed) ? (
                    <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Closing complaint...
                    </>
                ) : (
                    "Close complaint"
                )}
            </ Button>

        )
    }

    if (allowUnassign) {
        return (
            <div className="flex gap-2">
                {
                    currentAssignedTo && status === "PENDING" && (
                        <Button
                            onClick={handleStartWorkOnComplaint}
                        >
                            Start work
                        </Button>
                    )
                }
                {
                    (status !== "RESOLVED" && status !== "CLOSED") && (
                        <Button
                            disabled={isSubmitting}
                            onClick={handleUnAssignComplaint}
                        >
                            Unassign
                        </Button>
                    )
                }
            </div>
        )
    }

    return (
        <Button disabled>
            Assigned
        </Button>
    )
}