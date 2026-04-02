"use client"

import { useState } from "react"
import { CldImage } from "next-cloudinary"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"

interface MediaGalleryProps {
    urls: string[]
}

// Extract Cloudinary public_id from a secure_url
function getPublicId(url: string): string {
    // e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/folder/file.jpg
    // → folder/file  (strip version + extension)
    try {
        const parts = url.split("/upload/")
        if (parts.length < 2) return url
        const afterUpload = parts[1]
        // remove version segment like v1234567890/
        const withoutVersion = afterUpload.replace(/^v\d+\//, "")
        // remove extension
        return withoutVersion.replace(/\.[^/.]+$/, "")
    } catch {
        return url
    }
}

function isVideoUrl(url: string) {
    return /\.(mp4|webm|mov|avi)$/i.test(url)
}

export function MediaGallery({ urls }: MediaGalleryProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    if (!urls || urls.length === 0) return null

    const open = (i: number) => setLightboxIndex(i)
    const close = () => setLightboxIndex(null)
    const prev = () => setLightboxIndex((i) => (i! > 0 ? i! - 1 : urls.length - 1))
    const next = () => setLightboxIndex((i) => (i! < urls.length - 1 ? i! + 1 : 0))

    // Layout variants based on count
    const gridClass =
        urls.length === 1
            ? "grid-cols-1"
            : urls.length === 2
            ? "grid-cols-2"
            : urls.length === 3
            ? "grid-cols-3"
            : "grid-cols-2 sm:grid-cols-4"

    return (
        <>
            <div className={`grid ${gridClass} gap-2`}>
                {urls.map((url, i) => {
                    const isVideo = isVideoUrl(url)
                    const isTall = urls.length === 3 && i === 0
                    return (
                        <div
                            key={url}
                            onClick={() => open(i)}
                            className={`group relative overflow-hidden rounded-xl bg-muted cursor-zoom-in border border-border ${
                                isTall ? "row-span-2" : ""
                            } ${urls.length === 1 ? "aspect-video" : "aspect-square"}`}
                        >
                            {isVideo ? (
                                <video
                                    src={url}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    muted
                                />
                            ) : (
                                <CldImage
                                    src={getPublicId(url)}
                                    alt={`Attachment ${i + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, 50vw"
                                />
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </div>
                            {/* Count badge on last tile when overflow */}
                            {i === 3 && urls.length > 4 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                                    <span className="text-white text-xl font-bold" >
                                        +{urls.length - 4}
                                    </span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
                    onClick={close}
                >
                    {/* Close */}
                    <button
                        onClick={close}
                        className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Counter */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                        {lightboxIndex + 1} / {urls.length}
                    </div>

                    {/* Prev */}
                    {urls.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); prev() }}
                            className="absolute left-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                    )}

                    {/* Image */}
                    <div
                        className="relative max-h-[85vh] max-w-[90vw] w-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isVideoUrl(urls[lightboxIndex]) ? (
                            <video
                                src={urls[lightboxIndex]}
                                controls
                                autoPlay
                                className="max-h-[85vh] max-w-full rounded-lg"
                            />
                        ) : (
                            <div className="relative w-full h-[85vh]">
                                <CldImage
                                    src={getPublicId(urls[lightboxIndex])}
                                    alt={`Attachment ${lightboxIndex + 1}`}
                                    fill
                                    className="object-contain"
                                    sizes="90vw"
                                />
                            </div>
                        )}
                    </div>

                    {/* Next */}
                    {urls.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); next() }}
                            className="absolute right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    )}

                    {/* Thumbnail strip */}
                    {urls.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {urls.map((url, i) => (
                                <button
                                    key={url}
                                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                                    className={`h-1.5 rounded-full transition-all duration-200 ${
                                        i === lightboxIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}