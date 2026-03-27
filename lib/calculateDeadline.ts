import { PRIORITY } from "@/app/generated/prisma/enums";;

const daysPriorityMap = {
    HIGH: 1,
    MEDIUM: 3,
    LOW: 5,
};

export function calculateDeadline(priority: PRIORITY, createdAt: Date) {
    const createdTime = new Date(createdAt).getTime() 
    const deadline = daysPriorityMap[priority] * 24 * 60 * 60 * 1000;
    return new Date(createdTime + deadline);
}