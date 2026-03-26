"use client"

import React from 'react'
import * as z from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema } from '@/schemas/signUpSchema'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { signUpAction } from './action'
import Link from 'next/link'
import { Zap, User, Mail, Lock } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

function SignUp() {
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: ""
        }
    })

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        const res = await signUpAction(data)
        console.log("Res", res)
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
                        Create an account
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Join ResolveIt today
                    </p>
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <form id="form-signup" onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup className="space-y-4">
                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="name"
                                            className="text-sm font-medium text-foreground mb-1.5 block"
                                        >
                                            Full name
                                        </FieldLabel>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                id="name"
                                                type="text"
                                                aria-invalid={fieldState.invalid}
                                                placeholder="John Doe"
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
                                    form="form-signup"
                                    disabled={isSubmitting}
                                    className="w-full h-10 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all duration-200 disabled:opacity-60"
                                >
                                    {isSubmitting ? "Creating account..." : "Create account"}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-4">
                    Already have an account?{" "}
                    <Link
                        href="/sign-in"
                        className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default SignUp