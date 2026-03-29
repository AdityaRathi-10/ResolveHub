"use client"

import React, { useState } from 'react'
import { Button } from './ui/button'
import { assignComplaint, startWorkingOnComplaint, unassignComplaint } from '@/app/complaints/[id]/action'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AssignComplaintProps {
    assigned: boolean
    complaintId: string
    assignedTo: string | null
    status: string
}

export default function ComplaintActivityButton({ assigned, complaintId, assignedTo, status }: AssignComplaintProps) {
    const [isAssigned, setIsAssigned] = useState(assigned)
    const [currentAssignedTo, setCurrentAssignedTo] = useState(assignedTo)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()

    const allowUnassign = session?.user?.id && currentAssignedTo === session.user.id

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
            router.refresh()
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
            router.refresh()
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

    if (allowUnassign) {
        return (
            <div className="flex gap-2">
                <Button
                    disabled={isSubmitting}
                    onClick={handleUnAssignComplaint}
                >
                    Unassign
                </Button>
                {
                    currentAssignedTo && status === "PENDING" && (
                        <Button
                            onClick={handleStartWorkOnComplaint}
                        >
                            Start work
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