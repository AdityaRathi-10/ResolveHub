"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { signInSchema } from '@/schemas/signInSchema'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Mail, Lock } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

function SignIn() {
    const router = useRouter()

    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        const response = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false
        })

        if (response?.ok) {
            router.replace("/complaints")
        }
    }

    const isSubmitting = form.formState.isSubmitting

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            {/* Theme toggle in corner */}
            <div className="fixed top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 group mb-6">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span
                            className="font-semibold text-xl tracking-tight text-foreground"
                            style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                            ResolveIt
                        </span>
                    </Link>
                    <h1
                        className="text-2xl font-bold text-foreground mt-4"
                        style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                        Welcome back
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Sign in to your account
                    </p>
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <form id="form-signin" onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup className="space-y-4">
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="email"
                                            className="text-sm font-medium text-foreground mb-1.5 block"
                                        >
                                            Email
                                        </FieldLabel>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                id="email"
                                                type="email"
                                                aria-invalid={fieldState.invalid}
                                                placeholder="you@example.com"
                                                autoComplete="off"
                                                className="pl-9 h-10 text-sm bg-background border-input rounded-lg w-full"
                                            />
                                        </div>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} className="text-xs text-destructive mt-1" />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="password"
                                            className="text-sm font-medium text-foreground mb-1.5 block"
                                        >
                                            Password
                                        </FieldLabel>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                id="password"
                                                type="password"
                                                aria-invalid={fieldState.invalid}
                                                placeholder="••••••••"
                                                autoComplete="off"
                                                className="pl-9 h-10 text-sm bg-background border-input rounded-lg w-full"
                                            />
                                        </div>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} className="text-xs text-destructive mt-1" />
                                        )}
                                    </Field>
                                )}
                            />

                            <Field orientation="horizontal" className="pt-1">
                                <Button
                                    type="submit"
                                    form="form-signin"
                                    disabled={isSubmitting}
                                    className="w-full h-10 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all duration-200 disabled:opacity-60"
                                >
                                    {isSubmitting ? "Signing in..." : "Sign in"}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-4">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/sign-up"
                        className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default SignIn