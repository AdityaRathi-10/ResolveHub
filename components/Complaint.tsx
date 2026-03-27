interface ComplaintProps {
    title: string
    description?: string
    status: string
    assignedTo?: string
    createdBy: string
    createdAt: string
}

export default async function ComplaintCard({ 
    title,
    description,
    status,
    assignedTo,
    createdBy,
    createdAt
}: ComplaintProps) {
    
    return (
        <h1>Complaint card</h1>
    )
}