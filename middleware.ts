import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
    const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET
    })
    const url = request.nextUrl.pathname
    if(token && (
        url === "/" ||
        url.startsWith("/sign-in") ||
        url.startsWith("/sign-up")
    )) {
        return NextResponse.redirect(new URL("/complaints", request.url))
    }

    if(!token && (
        url.startsWith("/complaints")
    )) {
        return NextResponse.redirect(new URL("/sign-in", request.url))
    }

    return NextResponse.next()
}

export const config = { 
    matcher: [
        "/",
        "/sign-in",
        "/sign-up",
        "/complaints/:path*",
        "/complaint/:path*",
    ]
}