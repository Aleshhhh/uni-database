"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Book, ChevronRight, FileText, RefreshCw } from "lucide-react";
import type { Course } from "@/lib/data";
import { formatItalianDate } from "@/lib/format-date";
import { reloadData } from "@/app/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CreateCourseDialog, CreateFolderDialog, UploadFileDialog } from "@/components/dialogs";

export function Sidebar({ courses }: { courses: Course[] }) {
    const pathname = usePathname();
    const [openCourse, setOpenCourse] = useState<string | null>(null);
    const [syncing, startSync] = useTransition();

    function sync() {
        startSync(() => { reloadData(); });
    }

    function isActive(href: string) {
        return pathname === href;
    }

    return (
        <aside className="w-72 shrink-0 border-r border-border flex flex-col bg-card/60 backdrop-blur-xl">
            {/* Header */}
            <div className="h-14 px-4 flex items-center justify-between shrink-0">
                <span className="flex items-center gap-2 font-semibold text-sm tracking-tight">
                    <Book className="w-4 h-4 text-primary" />
                    Uni Portal
                </span>
                <div className="flex items-center gap-1.5">
                    <CreateCourseDialog />
                    <Button size="icon" variant="ghost" onClick={sync} disabled={syncing} title="Sync">
                        <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
                    </Button>
                </div>
            </div>
            <Separator />

            {/* Course list */}
            <ScrollArea className="flex-1">
                <nav className="p-2 space-y-0.5">
                    {courses.length === 0 ? (
                        <p className="px-3 py-6 text-xs text-muted-foreground text-center">
                            No courses yet. Hit <strong>+</strong> to create one.
                        </p>
                    ) : (
                        courses.map((course) => {
                            const isOpen = openCourse === course.name;
                            return (
                                <div key={course.name}>
                                    {/* Course row */}
                                    <div className="flex items-center rounded-md group hover:bg-accent/50 transition-colors">
                                        <button
                                            onClick={() => setOpenCourse(isOpen ? null : course.name)}
                                            className="flex-1 flex items-center gap-2 px-3 py-2 text-sm font-medium text-left"
                                        >
                                            <ChevronRight
                                                className={cn(
                                                    "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                                                    isOpen && "rotate-90"
                                                )}
                                            />
                                            <span className="truncate">{course.name}</span>
                                        </button>
                                        <CreateFolderDialog courseName={course.name} />
                                        <span className="w-1" />
                                    </div>

                                    {/* Folders */}
                                    {isOpen && (
                                        <div className="pl-5 pr-1 pb-1 space-y-3 mt-1">
                                            {course.folders.length === 0 ? (
                                                <p className="px-3 py-1 text-xs text-muted-foreground italic">No folders.</p>
                                            ) : (
                                                course.folders.map((folder) => {
                                                    const isExams = folder.name.toLowerCase() === "exams";
                                                    return (
                                                        <div key={folder.name} className="space-y-0.5 group/folder">
                                                            {/* Folder label */}
                                                            <div className="flex items-center justify-between px-2 py-0.5">
                                                                <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-muted-foreground">
                                                                    {folder.name}
                                                                </span>
                                                                <UploadFileDialog courseName={course.name} folderName={folder.name} />
                                                            </div>

                                                            {/* Files */}
                                                            {folder.files.length === 0 ? (
                                                                <p className="px-2 py-1 text-xs text-muted-foreground/60 italic">Empty</p>
                                                            ) : (
                                                                folder.files.map((file) => {
                                                                    const href = `/${encodeURIComponent(course.name)}/${encodeURIComponent(folder.name)}/${file.encodedName}`;
                                                                    const label = isExams ? formatItalianDate(file.name) : file.name;
                                                                    return (
                                                                        <Link
                                                                            key={file.name}
                                                                            href={href}
                                                                            className={cn(
                                                                                "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors",
                                                                                isActive(href)
                                                                                    ? "bg-primary text-primary-foreground"
                                                                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                                                            )}
                                                                        >
                                                                            <FileText className="w-3 h-3 shrink-0" />
                                                                            <span className="truncate" title={label}>{label}</span>
                                                                        </Link>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </nav>
            </ScrollArea>
        </aside>
    );
}
