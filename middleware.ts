import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export { default } from "next-auth/middleware"

export async function middleware(request: NextRequest) {
    const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET
    })
    const url = request.nextUrl

    if(token && (
        url.pathname === "/" ||
        url.pathname.startsWith("/sign-in") ||
        url.pathname.startsWith("/sign-up")
    )) {
        return NextResponse.redirect(new URL("/complaints", request.url))
    }

    if(!token && (
        url.pathname.startsWith("/complaints") ||
        url.pathname.startsWith("/complaint") ||
        url.pathname.startsWith("/create-complaint")
    )) {
        return NextResponse.redirect(new URL("/sign-in", request.url))
    }
}

export const config = { 
    matcher: [
        "/",
        "/sign-in",
        "/sign-up",
        "/complaints",
        "/complaint/:path*",
        "/create-complaint"            
    ]
}