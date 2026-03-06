"use client";

import Link from "next/link";
import { FileText, Folder, Upload } from "lucide-react";
import type { Course } from "@/lib/data";
import { formatItalianDate } from "@/lib/format-date";
import { CreateFolderDialog, UploadFileDialog } from "@/components/dialogs";
import { cn } from "@/lib/utils";

// One accent color per course, cycling through the list
const ACCENTS = [
    { border: "border-l-blue-500", header: "bg-blue-500/10", dot: "bg-blue-500", text: "text-blue-400" },
    { border: "border-l-violet-500", header: "bg-violet-500/10", dot: "bg-violet-500", text: "text-violet-400" },
    { border: "border-l-emerald-500", header: "bg-emerald-500/10", dot: "bg-emerald-500", text: "text-emerald-400" },
    { border: "border-l-amber-500", header: "bg-amber-500/10", dot: "bg-amber-500", text: "text-amber-400" },
    { border: "border-l-rose-500", header: "bg-rose-500/10", dot: "bg-rose-500", text: "text-rose-400" },
    { border: "border-l-cyan-500", header: "bg-cyan-500/10", dot: "bg-cyan-500", text: "text-cyan-400" },
    { border: "border-l-pink-500", header: "bg-pink-500/10", dot: "bg-pink-500", text: "text-pink-400" },
    { border: "border-l-lime-500", header: "bg-lime-500/10", dot: "bg-lime-500", text: "text-lime-400" },
];

export function CourseCard({ course, accentIndex }: { course: Course; accentIndex: number }) {
    const accent = ACCENTS[accentIndex % ACCENTS.length];
    const totalFiles = course.folders.reduce((sum, f) => sum + f.files.length, 0);

    return (
        <div className={cn(
            "rounded-xl border border-border bg-card/80 backdrop-blur overflow-hidden",
            "border-l-4 shadow-sm hover:shadow-md transition-shadow duration-200",
            accent.border
        )}>
            {/* Card header */}
            <div className={cn("px-4 py-3 flex items-start justify-between gap-2", accent.header)}>
                <div className="min-w-0">
                    <h2 className="font-semibold text-sm text-foreground truncate leading-snug" title={course.name}>
                        {course.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {course.folders.length} {course.folders.length === 1 ? "folder" : "folders"}
                        {totalFiles > 0 && ` · ${totalFiles} ${totalFiles === 1 ? "file" : "files"}`}
                    </p>
                </div>
                <CreateFolderDialog courseName={course.name} />
            </div>

            {/* Folders & files */}
            <div className="divide-y divide-border/50">
                {course.folders.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-muted-foreground italic">No folders.</p>
                ) : (
                    course.folders.map((folder) => {
                        const isExams = folder.name.toLowerCase() === "exams";
                        return (
                            <div key={folder.name} className="group/folder">
                                {/* Folder label row */}
                                <div className="flex items-center justify-between px-4 py-2 bg-muted/20">
                                    <div className="flex items-center gap-2">
                                        <Folder className={cn("w-3.5 h-3.5 shrink-0", accent.text)} />
                                        <span className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
                                            {folder.name}
                                        </span>
                                        {folder.files.length > 0 && (
                                            <span className="text-[0.65rem] text-muted-foreground/60">
                                                ({folder.files.length})
                                            </span>
                                        )}
                                    </div>
                                    <div className="opacity-0 group-hover/folder:opacity-100 transition-opacity">
                                        <UploadFileDialog courseName={course.name} folderName={folder.name} />
                                    </div>
                                </div>

                                {/* File list */}
                                <div className="px-2 py-1">
                                    {folder.files.length === 0 ? (
                                        <div
                                            className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer opacity-0 hover:opacity-100 transition-opacity group/empty"
                                            onClick={() => {
                                                // trigger the upload dialog — handled by UploadFileDialog
                                            }}
                                        >
                                            <span className="text-xs text-muted-foreground/50 italic flex items-center gap-1.5">
                                                <Upload className="w-3 h-3" />
                                                Drop files here
                                            </span>
                                        </div>
                                    ) : (
                                        folder.files.map((file) => {
                                            const href = `/${encodeURIComponent(course.name)}/${encodeURIComponent(folder.name)}/${file.encodedName}`;
                                            const label = isExams ? formatItalianDate(file.name) : file.name;
                                            return (
                                                <Link
                                                    key={file.name}
                                                    href={href}
                                                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors group/file"
                                                    title={label}
                                                >
                                                    <FileText className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50 group-hover/file:text-muted-foreground transition-colors" />
                                                    <span className="truncate">{label}</span>
                                                </Link>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
