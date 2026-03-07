"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Folder, FilePlus, Calendar } from "lucide-react";
import type { Course } from "@/lib/data";
import { formatItalianDate } from "@/lib/format-date";
import { CreateFolderDialog, UploadFileDialog } from "@/components/dialogs";
import { ExamYearEditor } from "@/components/exam-year-editor";
import { cn } from "@/lib/utils";
import {
    loadYearMap,
    saveYearMap,
    buildInitialYearMap,
    mergeYearMap,
    sortedYearKeys,
    type YearMap,
} from "@/lib/exam-years";

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

    // ── Exam year groupings ──────────────────────────────────────────────────
    const isExamsFolder = currentFolder?.name.toLowerCase() === "exams";
    const [yearMap, setYearMap] = useState<YearMap | null>(null);

    useEffect(() => {
        if (!isExamsFolder || !currentFolder) {
            setYearMap(null);
            return;
        }

        const fileNames = currentFolder.files.map((f) => f.name);
        const stored = loadYearMap(course.name);

        if (stored) {
            const merged = mergeYearMap(stored, fileNames);
            setYearMap(merged);
            saveYearMap(course.name, merged); // persist merges (new/removed files)
        } else {
            const initial = buildInitialYearMap(fileNames);
            saveYearMap(course.name, initial);
            setYearMap(initial);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExamsFolder, currentFolder?.name, course.name]);

    function handleYearMapSave(updated: YearMap) {
        saveYearMap(course.name, updated);
        setYearMap(updated);
    }

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
                        {/* Exam year editor – only visible when on an exams folder */}
                        {isExamsFolder && yearMap && currentFolder && (
                            <ExamYearEditor
                                courseName={course.name}
                                yearMap={yearMap}
                                allFiles={currentFolder.files.map((f) => f.name)}
                                onSave={handleYearMapSave}
                            />
                        )}
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

            {/* ── File grid / year groups ── */}
            {course.folders.length === 0 ? (
                <EmptyFolders courseName={course.name} />
            ) : !currentFolder || currentFolder.files.length === 0 ? (
                <EmptyFolder courseName={course.name} folderName={activeFolder} />
            ) : isExamsFolder && yearMap ? (
                // ── Exams: year-grouped view ─────────────────────────────────
                <ExamYearView
                    course={course}
                    folder={currentFolder}
                    yearMap={yearMap}
                    accent={accent}
                />
            ) : (
                // ── Other folders: standard flat grid ────────────────────────
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {currentFolder.files.map((file) => {
                        const label = file.name;
                        const href = `/${encodeURIComponent(course.name)}/${encodeURIComponent(currentFolder.name)}/${file.encodedName}`;
                        return (
                            <FileCard
                                key={file.name}
                                label={label}
                                href={href}
                                folderName={currentFolder.name}
                                accent={accent}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Exam year-grouped view ──────────────────────────────────────────────────

function ExamYearView({
    course,
    folder,
    yearMap,
    accent,
}: {
    course: Course;
    folder: { name: string; files: { name: string; encodedName: string }[] };
    yearMap: YearMap;
    accent: Accent;
}) {
    // Build a quick lookup: filename → FileItem
    const fileIndex = new Map(folder.files.map((f) => [f.name, f]));
    const years = sortedYearKeys(yearMap);

    // Years that actually have files present in the folder
    const populated = years.filter((y) => {
        const names = yearMap[y];
        return names?.some((n) => fileIndex.has(n));
    });

    if (populated.length === 0) {
        return <EmptyFolder courseName={course.name} folderName={folder.name} />;
    }

    return (
        <div className="space-y-8">
            {populated.map((year) => {
                const fileNames = yearMap[year].filter((n) => fileIndex.has(n));

                return (
                    <section key={year}>
                        {/* Year header */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className={cn("flex items-center gap-1.5 text-sm font-semibold", accent.text)}>
                                <Calendar className="w-4 h-4" />
                                {year}
                            </div>
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs text-muted-foreground">
                                {fileNames.length} {fileNames.length === 1 ? "exam" : "exams"}
                            </span>
                        </div>

                        {/* Files grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {fileNames.map((name) => {
                                const file = fileIndex.get(name)!;
                                const label = formatItalianDate(file.name);
                                const href = `/${encodeURIComponent(course.name)}/${encodeURIComponent(folder.name)}/${file.encodedName}`;
                                return (
                                    <FileCard
                                        key={file.name}
                                        label={label}
                                        href={href}
                                        folderName={folder.name}
                                        accent={accent}
                                    />
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

// ─── Shared file card ────────────────────────────────────────────────────────

function FileCard({
    label,
    href,
    folderName,
    accent,
}: {
    label: string;
    href: string;
    folderName: string;
    accent: Accent;
}) {
    return (
        <Link
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
                    {folderName}
                </p>
            </div>
        </Link>
    );
}

// ─── Empty states ────────────────────────────────────────────────────────────

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
