"use client";

import { ChevronRight, FileText } from "lucide-react";
import type { Course } from "@/lib/data";
import { cn } from "@/lib/utils";

type Accent = {
    border: string;
    ring: string;
    dot: string;
    text: string;
    headerBg: string;
};

const MAX_FILES_PER_FOLDER = 3;

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

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left rounded-xl border border-border bg-card/80 backdrop-blur overflow-hidden",
                "border-l-4 shadow-sm transition-all duration-200",
                "hover:shadow-lg hover:scale-[1.01] hover:ring-2 hover:border-border",
                accent.border,
                accent.ring
            )}
        >
            {/* ── Header ── */}
            <div className={cn("px-4 py-3 flex items-center justify-between gap-2", accent.headerBg)}>
                <div className="flex items-center gap-2 min-w-0">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", accent.dot)} />
                    <h2 className="font-semibold text-sm text-foreground truncate" title={course.name}>
                        {course.name}
                    </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                        {totalFiles} {totalFiles === 1 ? "file" : "files"}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                </div>
            </div>

            {/* ── Folder columns ── */}
            {course.folders.length === 0 ? (
                <div className="px-4 py-4 text-xs text-muted-foreground/50 italic">
                    No folders yet — click to set up.
                </div>
            ) : (
                <div className={cn(
                    "grid divide-x divide-border/50 border-t border-border/50",
                    course.folders.length === 1 ? "grid-cols-1" :
                        course.folders.length === 2 ? "grid-cols-2" :
                            "grid-cols-3"
                )}>
                    {course.folders.slice(0, 3).map((folder) => {
                        const preview = folder.files.slice(0, MAX_FILES_PER_FOLDER);
                        const overflow = folder.files.length - MAX_FILES_PER_FOLDER;
                        return (
                            <div key={folder.name} className="px-3 pt-2.5 pb-3 flex flex-col gap-1.5 min-w-0">
                                {/* Folder name */}
                                <div className={cn("text-[0.6rem] font-semibold uppercase tracking-widest truncate", accent.text)}>
                                    {folder.name}
                                </div>

                                {/* Files */}
                                {preview.length === 0 ? (
                                    <span className="text-[0.65rem] text-muted-foreground/40 italic">Empty</span>
                                ) : (
                                    <div className="space-y-1">
                                        {preview.map((file) => (
                                            <div
                                                key={file.name}
                                                className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground leading-tight"
                                            >
                                                <FileText className="w-2.5 h-2.5 shrink-0 text-muted-foreground/40" />
                                                <span className="truncate">{file.name}</span>
                                            </div>
                                        ))}
                                        {overflow > 0 && (
                                            <p className={cn("text-[0.65rem] font-medium pl-4", accent.text)}>
                                                +{overflow} more
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </button>
    );
}
