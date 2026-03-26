import "next-auth"
import { DefaultSession } from "next-auth"
import { ROLE } from "@/app/generated/prisma/enums"

declare module "next-auth" {
    interface User {
        role: ROLE
    }

    interface Session {
        user: {
            role: ROLE
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: ROLE
    }
}