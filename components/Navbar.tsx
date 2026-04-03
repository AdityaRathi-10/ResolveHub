"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./ThemeToggle"
import { NAV_ITEMS } from "@/lib/navItems"
import { ROLE } from "@/app/generated/prisma/enums"
import { useState } from "react"
import { Zap, ChevronDown, LogOut, Menu, X } from "lucide-react"

const AUTH_ROUTES = ["/sign-in", "/sign-up"]

const ROLE_STYLES: Record<ROLE, string> = {
    STUDENT: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    CARETAKER: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    SUPERVISOR: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
}

export default function Navbar() {
    const { data: session, status } = useSession()
    const pathname = usePathname()
    const [profileOpen, setProfileOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    if (AUTH_ROUTES.includes(pathname)) return null

    const user = session?.user
    const role = user?.role as ROLE | undefined
    const navLinks = role ? NAV_ITEMS[role] : []

    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U"

    const isLoading = status === "loading"

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="h-8 w-8 rounded-lg bg-purple-900 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-base tracking-tight text-foreground">
                            ResolveIt
                        </span>
                    </Link>

                    {/* Center nav (desktop) */}
                    {user && navLinks.length > 0 && (
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    (item.href !== "/complaints" && pathname.startsWith(item.href))
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                            ? "text-primary bg-primary/10"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            }`}
                                    >
                                        {item.label}
                                        {isActive && (
                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 bg-primary rounded-full" />
                                        )}
                                    </Link>
                                )
                            })}
                        </nav>
                    )}

                    {/* Right actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <ThemeToggle />

                        {isLoading ? (
                            <div className="h-9 w-20 bg-muted animate-pulse rounded-lg" />
                        ) : user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen((v) => !v)}
                                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-muted transition-colors duration-150"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <span
                                            className="text-xs font-bold text-primary"

                                        >
                                            {initials}
                                        </span>
                                    </div>
                                    {role && (
                                        <span className={`hidden sm:inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${ROLE_STYLES[role]}`}>
                                            {role}
                                        </span>
                                    )}
                                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                                </button>

                                {profileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-56 z-20 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                                            {/* User info */}
                                            <div className="px-4 py-3 border-b border-border">
                                                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                                                {role && (
                                                    <span className={`mt-2 inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${ROLE_STYLES[role]}`}>
                                                        {role}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Sign out */}
                                            <div className="p-1">
                                                <button
                                                    onClick={() => signOut({ callbackUrl: "/sign-in" })}
                                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors duration-150"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/sign-in"
                                    className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="text-sm font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}

                        {/* Mobile hamburger */}
                        {!isLoading && user && (
                            <button
                                className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                                onClick={() => setMobileOpen((v) => !v)}
                                aria-label="Toggle menu"
                            >
                                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile drawer */}
            {mobileOpen && user && (
                <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
                    <div className="mx-auto max-w-7xl px-4 py-3 space-y-1">
                        {navLinks.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        }`}
                                >
                                    {item.label}
                                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                </Link>
                            )
                        })}

                        <div className="pt-2 mt-2 border-t border-border">
                            <div className="flex items-center gap-3 px-3 py-2 mb-1">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-primary" >
                                        {initials}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                                className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}