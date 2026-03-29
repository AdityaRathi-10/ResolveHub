import { ROLE } from "@/app/generated/prisma/enums";

interface NavigationProps {
    label: string
    href: string
}

export const NAV_ITEMS: Record<ROLE, NavigationProps[]> = {
    STUDENT: [
        { label: "Dashboard", href: "/complaints" },
        { label: "My Complaints", href: "/complaints/me" },
    ],
    CARETAKER: [
        { label: "Dashboard", href: "/complaints" },
        { label: "My Tasks", href: "/complaints/me" }
    ],
    SUPERVISOR: [
        { label: "Dashboard", href: "/complaints" },
        { label: "Leaderboard", href: "/leaderboard" }
    ]
}