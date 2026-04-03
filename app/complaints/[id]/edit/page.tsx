import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import ComplaintForm from "@/components/ComplaintForm"

export default async function EditComplaintPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/sign-in")

    const { id } = await params

    const complaint = await prisma.complaint.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            description: true,
            media: true,
            priority: true,
            userId: true,
            status: true,
        },
    })

    if (!complaint) notFound()

    if (complaint.userId !== session.user.id) redirect(`/complaints/${id}`)
    if (complaint.status !== "PENDING") redirect(`/complaints/${id}`)

    return (
        <ComplaintForm
            mode="edit"
            complaintId={complaint.id}
            initialData={{
                title: complaint.title,
                description: complaint.description,
                media: complaint.media,
                priority: complaint.priority,
            }}
        />
    )
}