import { prisma } from "./prisma";

export async function escalateComplaints() {
    await prisma.complaint.updateMany({
        where: {
            deadline: {
                lt: new Date(),
            },
            status: {
                notIn: ["RESOLVED", "CLOSED"],
            },
            isEscalated: false
        },
        data: {
            isEscalated: true
        }
    })
}