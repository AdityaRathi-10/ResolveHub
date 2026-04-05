"use client"

import { useEffect, useState } from "react"
import { UserCheck } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { getComplaintStatus } from "@/app/complaints/[id]/actions/complaint.actions"

interface ComplaintAssignedToProps {
    complaintId: string
    assignedToName: string | undefined
}

export default function ComplaintAssignTo({ complaintId, assignedToName }: ComplaintAssignedToProps) {
    const [currentAssignedToName, setCurrentAssignedToName] = useState(assignedToName)

    useEffect(() => {
        const channel = supabase
            .channel('complaint-assignedTo-realtime')
            .on(
                'postgres_changes', { 
                    event: '*',
                    schema: 'public',
                    table: 'Complaint',
                    filter: `id=eq.${complaintId}`,
                },
                async () => {
                    const { data } = await getComplaintStatus(complaintId)
                    if (data?.assignedTo) {
                        setCurrentAssignedToName(data.assignedTo.name)
                    }
                    else {
                        setCurrentAssignedToName(undefined)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    })

    return (
        <div>
            <p className="text-xs text-muted-foreground mb-1.5">Assigned to</p>
            {currentAssignedToName ? (
                <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">
                        {currentAssignedToName}
                    </span>
                </div>
            ) : (
                <span className="text-sm text-muted-foreground">Unassigned</span>
            )}
        </div>
    )
}