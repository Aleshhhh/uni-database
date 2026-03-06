"use client";

import { ChevronRight, FileText, Folder } from "lucide-react";
import type { Course } from "@/lib/data";
import { cn } from "@/lib/utils";

type Accent = {
    border: string;
    ring: string;
    dot: string;
    text: string;
    headerBg: string;
};

const MAX_PREVIEW_FILES = 4;

export function CompactCourseCard({
    course,
    accent,
    onClick,
}: {
    course: Course;
    accent: Accent;
    onClick: () => void;
}) {
    const totalFiles = course.folders.reduce((n, f) => n + f.files.length, 0);
    // Flatten a few file names for preview
    const previewFiles = course.folders.flatMap((f) =>
        f.files.map((file) => ({ folder: f.name, ...file }))
    ).slice(0, MAX_PREVIEW_FILES);

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left rounded-xl border border-border bg-card/80 backdrop-blur",
                "border-l-4 shadow-sm transition-all duration-200",
                "hover:shadow-lg hover:scale-[1.01] hover:ring-2 hover:border-border",
                accent.border,
                accent.ring
            )}
        >
            {/* Header */}
            <div className={cn("px-4 py-3 flex items-start justify-between gap-2 rounded-t-xl", accent.headerBg)}>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full shrink-0", accent.dot)} />
                        <h2 className="font-semibold text-sm text-foreground truncate leading-snug" title={course.name}>
                            {course.name}
                        </h2>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 pl-4">
                        {course.folders.length} {course.folders.length === 1 ? "folder" : "folders"}
                        {" · "}
                        {totalFiles} {totalFiles === 1 ? "file" : "files"}
                    </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" />
            </div>

            {/* Folder summary + preview files */}
            <div className="px-4 pt-3 pb-4 space-y-2.5">
                {/* Folder pills */}
                <div className="flex flex-wrap gap-1.5">
                    {course.folders.map((folder) => (
                        <span
                            key={folder.name}
                            className={cn(
                                "inline-flex items-center gap-1 text-[0.65rem] font-medium px-2 py-0.5 rounded-full border border-border bg-muted/40",
                                accent.text
                            )}
                        >
                            <Folder className="w-2.5 h-2.5" />
                            {folder.name}
                            <span className="text-muted-foreground font-normal ml-0.5">{folder.files.length}</span>
                        </span>
                    ))}
                    {course.folders.length === 0 && (
                        <span className="text-xs text-muted-foreground italic">No folders yet</span>
                    )}
                </div>

                {/* File preview */}
                {previewFiles.length > 0 && (
                    <div className="space-y-1 border-t border-border/50 pt-2">
                        {previewFiles.map((file) => (
                            <div
                                key={`${file.folder}-${file.name}`}
                                className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                                <FileText className="w-3 h-3 shrink-0 text-muted-foreground/40" />
                                <span className="truncate">{file.name}</span>
                            </div>
                        ))}
                        {totalFiles > MAX_PREVIEW_FILES && (
                            <p className={cn("text-xs font-medium pl-5", accent.text)}>
                                +{totalFiles - MAX_PREVIEW_FILES} more…
                            </p>
                        )}
                    </div>
                )}

                {totalFiles === 0 && course.folders.length > 0 && (
                    <p className="text-xs text-muted-foreground/50 italic border-t border-border/50 pt-2">
                        No files yet — click to upload.
                    </p>
                )}
            </div>
        </button>
    );
}
