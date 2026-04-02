"use client"

import * as z from "zod"
import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary"
import { useState } from "react"
import { complaintSchema } from "@/schemas/complaintSchema"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    FileText,
    AlignLeft,
    ImagePlus,
    X,
    AlertTriangle,
    ArrowLeft,
    Loader2,
} from "lucide-react"
import Link from "next/link"
import createComplaintAction from "./action"
import { useRouter } from "next/navigation"
import Image from "next/image"

const PRIORITY_OPTIONS = [
    {
        value: "LOW",
        label: "Low",
        description: "Minor issue, not time-sensitive",
        textColor: "text-emerald-600 dark:text-emerald-400",
        selectedClass: "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-inset ring-emerald-500/30",
        idleClass: "bg-muted/50 border-border hover:bg-emerald-500/5 hover:border-emerald-500/25",
        dot: "bg-emerald-500",
    },
    {
        value: "MEDIUM",
        label: "Medium",
        description: "Moderate impact, needs attention",
        textColor: "text-amber-600 dark:text-amber-400",
        selectedClass: "bg-amber-500/10 border-amber-500/40 ring-1 ring-inset ring-amber-500/30",
        idleClass: "bg-muted/50 border-border hover:bg-amber-500/5 hover:border-amber-500/25",
        dot: "bg-amber-500",
    },
    {
        value: "HIGH",
        label: "High",
        description: "Urgent, requires immediate action",
        textColor: "text-red-600 dark:text-red-400",
        selectedClass: "bg-red-500/10 border-red-500/40 ring-1 ring-inset ring-red-500/30",
        idleClass: "bg-muted/50 border-border hover:bg-red-500/5 hover:border-red-500/25",
        dot: "bg-red-500",
    },
]

export default function CreateComplaintPage() {
    const [imageUrls, setImageUrls] = useState<string[]>([])
    const [isComplaintCreated, setIsComplaintCreated] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof complaintSchema>>({
        resolver: zodResolver(complaintSchema),
        defaultValues: {
            title: "",
            description: "",
            media: [],
            priority: undefined,
        },
    })

    const onSubmit = async (data: z.infer<typeof complaintSchema>) => {
        const dataWithMediaFiles = { ...data, media: imageUrls }
        const response = await createComplaintAction(dataWithMediaFiles)
        if (response.success) {
            setIsComplaintCreated(true)
            router.replace("/complaints")
        }
    }

    const isSubmitting = form.formState.isSubmitting

    const removeImage = (url: string) => {
        setImageUrls((prev) => prev.filter((u) => u !== url))
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">

                {/* Back link */}
                <Link
                    href="/complaints"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
                    Back to complaints
                </Link>

                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground">
                        New Complaint
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Describe your issue clearly so it can be resolved quickly.
                    </p>
                </div>

                {/* Form card */}
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <form id="form-new-complaint" onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup className="divide-y divide-border">

                            {/* Title */}
                            <div className="px-6 py-5">
                                <Controller
                                    name="title"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                                <FieldLabel
                                                    htmlFor="title"
                                                    className="text-sm font-medium text-foreground"
                                                >
                                                    Title
                                                    <span className="text-destructive ml-0.5">*</span>
                                                </FieldLabel>
                                            </div>
                                            <Input
                                                {...field}
                                                id="title"
                                                type="text"
                                                placeholder="Brief summary of the issue"
                                                autoComplete="off"
                                                aria-invalid={fieldState.invalid}
                                                className="h-10 text-sm bg-background border-input rounded-lg w-full focus-visible:ring-primary/30"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1.5">
                                                Keep it short and descriptive.
                                            </p>
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                    className="text-xs text-destructive mt-1"
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>

                            {/* Description */}
                            <div className="px-6 pb-6">
                                <Controller
                                    name="description"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <AlignLeft className="h-3.5 w-3.5 text-muted-foreground" />
                                                <FieldLabel
                                                    htmlFor="description"
                                                    className="text-sm font-medium text-foreground"
                                                >
                                                    Description
                                                </FieldLabel>
                                            </div>
                                            <Textarea
                                                {...field}
                                                id="description"
                                                rows={14}
                                                placeholder="Explain the issue in detail..."
                                                aria-invalid={fieldState.invalid}
                                                className="w-full text-sm bg-background border-input rounded-lg resize-none focus-visible:ring-primary/30"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                    className="text-xs text-destructive mt-1"
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>

                            {/* Priority */}
                            <div className="px-6 pb-5">
                                <Controller
                                    name="priority"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                                                <FieldLabel className="text-sm font-medium text-foreground">
                                                    Priority
                                                    <span className="text-destructive ml-0.5">*</span>
                                                </FieldLabel>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2.5">
                                                {PRIORITY_OPTIONS.map((opt) => {
                                                    const isSelected = field.value === opt.value
                                                    return (
                                                        // Plain <button> — avoids shadcn Button's baked-in
                                                        // hover:bg-accent override that would swallow custom hover colours
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => field.onChange(opt.value)}
                                                            className={`
                                                                relative flex flex-col items-start gap-1 rounded-xl border
                                                                px-3.5 py-3 text-left transition-all duration-150
                                                                ${isSelected ? opt.selectedClass : opt.idleClass}
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
                                                                <span className={`text-xs font-semibold ${isSelected ? opt.textColor : "text-foreground"}`}>
                                                                    {opt.label}
                                                                </span>
                                                            </div>
                                                            <span className="text-[11px] text-muted-foreground leading-tight hidden sm:block">
                                                                {opt.description}
                                                            </span>
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                    className="text-xs text-destructive mt-2"
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>

                            {/* Media upload */}
                            <div className="px-6 pb-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        Attachments
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1">(optional)</span>
                                </div>

                                {/* Image previews */}
                                {imageUrls.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {imageUrls.map((url) => (
                                            <div
                                                key={url}
                                                className="relative group h-16 w-16 rounded-lg overflow-hidden border border-border bg-muted shrink-0"
                                            >
                                                <Image
                                                    src={url}
                                                    alt="Attachment"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeImage(url)}
                                                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-none h-full w-full hover:bg-black/60"
                                                >
                                                    <X className="h-4 w-4 text-white" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <CldUploadWidget
                                    uploadPreset="resolveit"
                                    options={{
                                        folder: "resolvehub/uploads",
                                        resourceType: "auto",
                                        multiple: true,
                                    }}
                                    onSuccess={(result: CloudinaryUploadWidgetResults) => {
                                        if (typeof result.info === "object" && result.info !== null) {
                                            const url = result.info.secure_url
                                            setImageUrls((prev) => [...prev, url])
                                        }
                                    }}
                                    onQueuesEnd={(result, { widget }) => {
                                        widget.close()
                                    }}
                                >
                                    {({ open }) => (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => open()}
                                            className="flex items-center gap-3 w-full h-auto rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3.5 hover:border-foreground/30 hover:bg-muted/60 transition-all duration-150 group justify-start"
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 group-hover:border-foreground/20 transition-colors">
                                                <ImagePlus className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-foreground">
                                                    {imageUrls.length > 0 ? "Add more files" : "Upload files"}
                                                </p>
                                                <p className="text-xs text-muted-foreground font-normal">
                                                    Images, videos or documents
                                                </p>
                                            </div>
                                        </Button>
                                    )}
                                </CldUploadWidget>
                            </div>

                        </FieldGroup>

                        {/* Footer actions */}
                        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-muted/30 border-t border-border">
                            <Link
                                href="/complaints"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cancel
                            </Link>
                            <Button
                                type="submit"
                                disabled={isSubmitting || isComplaintCreated}
                                className="h-9 px-5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all duration-150 disabled:opacity-60 gap-2"
                            >
                                {(isSubmitting || isComplaintCreated) ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit complaint"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    )
}