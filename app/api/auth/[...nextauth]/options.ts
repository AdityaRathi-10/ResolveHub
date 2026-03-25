import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "text"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize(credentials) {
                try {
                    if(!credentials?.email || !credentials?.password) {
                        throw new Error("Missing credentials")
                    }
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email
                        }
                    })
                    if(!user) {
                        throw new Error("User not found")
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                    if(!isPasswordCorrect) {
                        throw new Error("Invalid password")
                    }
                    return user
                } catch (error) {
                    throw new Error("Error")
                }
            },
        })
    ],
    callbacks: {
        async session({ session, token }) {
            return session
        },
        async jwt({ token, user }) {
            console.log("user", user)
            return token
        }
    },
    pages: {
        signIn: "/sign-in"
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
}