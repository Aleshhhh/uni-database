"use client";

import Link from "next/link";
import { CourseFolders } from "@/lib/data";
import { formatItalianDate } from "@/lib/format-date";
import { syncDataDir } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Book, Folder, FileText } from "lucide-react";
import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CreateCourseDialog, CreateFolderDialog, UploadFileDialog } from "./sidebar-dialogs";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function Sidebar({ courses }: { courses: { name: string; content: CourseFolders }[] }) {
    const [isPending, startTransition] = useTransition();
    const [openCourse, setOpenCourse] = useState<string | null>(null);
    const pathname = usePathname();

    function handleSync() {
        startTransition(() => {
            syncDataDir();
        });
    }

    function getActiveState(path: string) {
        return pathname === path ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-muted-foreground";
    }

    return (
        <div className="w-80 border-r flex flex-col bg-card/50 backdrop-blur-xl">
            <div className="p-4 flex items-center justify-between">
                <div className="font-semibold text-lg flex items-center gap-2 tracking-tight">
                    <Book className="w-5 h-5 text-primary" />
                    Uni Portal
                </div>
                <div className="flex items-center gap-2">
                    <CreateCourseDialog />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSync}
                        disabled={isPending}
                        title="Sync"
                    >
                        <RefreshCw className={cn("w-4 h-4", isPending && "animate-spin")} />
                    </Button>
                </div>
            </div>
            <Separator />

            <ScrollArea className="flex-1 py-4">
                {courses.length === 0 ? (
                    <div className="px-4 text-sm text-muted-foreground italic">No courses found. Create one!</div>
                ) : (
                    <div className="px-3 space-y-1">
                        {courses.map((course) => (
                            <div key={course.name} className="flex flex-col">
                                <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors group">
                                    <button
                                        onClick={() => setOpenCourse(openCourse === course.name ? null : course.name)}
                                        className="flex-1 flex items-center gap-2 text-sm font-medium text-left"
                                    >
                                        <Folder className="w-4 h-4 text-primary" />
                                        {course.name}
                                    </button>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <CreateFolderDialog courseName={course.name} />
                                    </div>
                                </div>

                                {openCourse === course.name && (
                                    <div className="pl-6 pr-2 pt-1 pb-2 space-y-4">
                                        {Object.entries(course.content)
                                            .sort(([a], [b]) => a.localeCompare(b))
                                            .map(([folderName, files]) => (
                                                <div key={folderName} className="space-y-1">
                                                    <div className="flex items-center justify-between pr-2 mb-2 group/folder">
                                                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                            {folderName}
                                                        </div>
                                                        <div className="opacity-0 group-hover/folder:opacity-100 transition-opacity">
                                                            <UploadFileDialog courseName={course.name} folderName={folderName} />
                                                        </div>
                                                    </div>

                                                    {files.length === 0 ? (
                                                        <div className="text-xs text-muted-foreground italic px-1.5 py-1">Empty</div>
                                                    ) : (
                                                        files.map((file) => {
                                                            const href = `/${encodeURIComponent(course.name)}/${encodeURIComponent(folderName)}/${file.path}`;
                                                            const isExams = folderName.toLowerCase() === "exams";
                                                            const displayName = isExams ? formatItalianDate(file.name) : file.name;
                                                            return (
                                                                <Link key={file.name} href={href} className={cn("flex items-center gap-2 p-1.5 rounded-md text-sm transition-colors", getActiveState(href))}>
                                                                    <FileText className="w-3.5 h-3.5 shrink-0" />
                                                                    <span className="truncate" title={displayName}>{displayName}</span>
                                                                </Link>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
