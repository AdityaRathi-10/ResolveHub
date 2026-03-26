"use client"

import React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
    children
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider>
            {children}
        </NextThemesProvider>
    )
}