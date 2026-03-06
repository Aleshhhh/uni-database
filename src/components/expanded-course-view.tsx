"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Folder, FilePlus } from "lucide-react";
import type { Course } from "@/lib/data";
import { formatItalianDate } from "@/lib/format-date";
import { CreateFolderDialog, UploadFileDialog } from "@/components/dialogs";
import { cn } from "@/lib/utils";

type Accent = {
    border: string;
    dot: string;
    text: string;
    tab: string;
    headerBg: string;
};

export function ExpandedCourseView({
    course,
    accent,
    onClose,
}: {
    course: Course;
    accent: Accent;
    onClose: () => void;
}) {
    const [activeFolder, setActiveFolder] = useState<string>(
        course.folders[0]?.name ?? ""
    );

    const currentFolder = course.folders.find((f) => f.name === activeFolder) ?? null;
    const totalFiles = course.folders.reduce((n, f) => n + f.files.length, 0);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* ── Expanded header ── */}
            <div className={cn("rounded-xl border border-border border-l-4 mb-6 overflow-hidden", accent.border)}>
                <div className={cn("px-6 py-5 flex items-start gap-4", accent.headerBg)}>
                    {/* Back */}
                    <button
                        onClick={onClose}
                        className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 border border-border/60 rounded-md px-2.5 py-1.5 bg-background/40 hover:bg-background/70"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        All courses
                    </button>

                    {/* Title block */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                            <div className={cn("w-3 h-3 rounded-full shrink-0", accent.dot)} />
                            <h1 className="text-xl font-bold tracking-tight text-foreground truncate">
                                {course.name}
                            </h1>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 pl-5.5">
                            {course.folders.length} {course.folders.length === 1 ? "folder" : "folders"}
                            {" · "}
                            {totalFiles} {totalFiles === 1 ? "file" : "files"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <CreateFolderDialog courseName={course.name} variant="button" />
                        {currentFolder && (
                            <UploadFileDialog courseName={course.name} folderName={currentFolder.name} variant="button" />
                        )}
                    </div>
                </div>

                {/* Folder tabs */}
                {course.folders.length > 0 && (
                    <div className="flex items-center gap-0 border-t border-border/50 bg-background/30 px-2 overflow-x-auto">
                        {course.folders.map((folder) => (
                            <button
                                key={folder.name}
                                onClick={() => setActiveFolder(folder.name)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                    activeFolder === folder.name
                                        ? cn("border-current", accent.tab)
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                                )}
                            >
                                <Folder className="w-3.5 h-3.5" />
                                {folder.name}
                                <span className={cn(
                                    "text-xs rounded-full px-1.5 py-0.5 font-normal",
                                    activeFolder === folder.name
                                        ? cn("bg-current/15", accent.text)
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    {folder.files.length}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── File grid ── */}
            {course.folders.length === 0 ? (
                <EmptyFolders courseName={course.name} />
            ) : !currentFolder || currentFolder.files.length === 0 ? (
                <EmptyFolder courseName={course.name} folderName={activeFolder} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {currentFolder.files.map((file) => {
                        const isExams = currentFolder.name.toLowerCase() === "exams";
                        const label = isExams ? formatItalianDate(file.name) : file.name;
                        const href = `/${encodeURIComponent(course.name)}/${encodeURIComponent(currentFolder.name)}/${file.encodedName}`;
                        return (
                            <Link
                                key={file.name}
                                href={href}
                                title={label}
                                className={cn(
                                    "group flex items-center gap-3 p-4 rounded-xl border border-border bg-card",
                                    "hover:border-current hover:bg-card/80 hover:shadow-sm transition-all duration-150",
                                    accent.text
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs border",
                                    "bg-muted/50 border-border text-muted-foreground group-hover:bg-current/10 group-hover:border-current/30 transition-colors"
                                )}>
                                    PDF
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-foreground truncate leading-snug">
                                        {label}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        {currentFolder.name}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function EmptyFolders({ courseName }: { courseName: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="w-14 h-14 rounded-xl bg-card border border-border flex items-center justify-center">
                <Folder className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
                <p className="font-medium text-sm">No folders yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">Add a folder to start organizing files.</p>
            </div>
            <CreateFolderDialog courseName={courseName} variant="button" />
        </div>
    );
}

function EmptyFolder({ courseName, folderName }: { courseName: string; folderName: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="w-14 h-14 rounded-xl bg-card border border-border flex items-center justify-center">
                <FilePlus className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
                <p className="font-medium text-sm">No files in {folderName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Upload PDFs to populate this folder.</p>
            </div>
            <UploadFileDialog courseName={courseName} folderName={folderName} variant="button" />
        </div>
    );
}
