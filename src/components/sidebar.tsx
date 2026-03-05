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
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSync}
                    disabled={isPending}
                >
                    <RefreshCw className={cn("w-4 h-4", isPending && "animate-spin")} />
                </Button>
            </div>
            <Separator />

            <ScrollArea className="flex-1 py-4">
                {courses.length === 0 ? (
                    <div className="px-4 text-sm text-muted-foreground italic">No courses found in /data.</div>
                ) : (
                    <div className="px-3 space-y-1">
                        {courses.map((course) => (
                            <div key={course.name} className="flex flex-col">
                                <button
                                    onClick={() => setOpenCourse(openCourse === course.name ? null : course.name)}
                                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 text-sm font-medium transition-colors"
                                >
                                    <Folder className="w-4 h-4 text-primary" />
                                    {course.name}
                                </button>

                                {openCourse === course.name && (
                                    <div className="pl-6 pr-2 pt-1 pb-2 space-y-4">
                                        {/* Slides */}
                                        {course.content.slides.length > 0 && (
                                            <div className="space-y-1">
                                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Slides</div>
                                                {course.content.slides.map((file) => {
                                                    const href = `/${encodeURIComponent(course.name)}/slides/${file.path}`;
                                                    return (
                                                        <Link key={file.name} href={href} className={cn("flex items-center gap-2 p-1.5 rounded-md text-sm transition-colors", getActiveState(href))}>
                                                            <FileText className="w-3.5 h-3.5" />
                                                            <span className="truncate" title={file.name}>{file.name}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Exams */}
                                        {course.content.exams.length > 0 && (
                                            <div className="space-y-1">
                                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Exams</div>
                                                {course.content.exams.map((file) => {
                                                    const href = `/${encodeURIComponent(course.name)}/exams/${file.path}`;
                                                    const displayName = formatItalianDate(file.name);
                                                    return (
                                                        <Link key={file.name} href={href} className={cn("flex items-center gap-2 p-1.5 rounded-md text-sm transition-colors", getActiveState(href))}>
                                                            <FileText className="w-3.5 h-3.5" />
                                                            <span className="truncate" title={displayName}>{displayName}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Other */}
                                        {course.content.other.length > 0 && (
                                            <div className="space-y-1">
                                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Other</div>
                                                {course.content.other.map((file) => {
                                                    const href = `/${encodeURIComponent(course.name)}/other/${file.path}`;
                                                    return (
                                                        <Link key={file.name} href={href} className={cn("flex items-center gap-2 p-1.5 rounded-md text-sm transition-colors", getActiveState(href))}>
                                                            <FileText className="w-3.5 h-3.5" />
                                                            <span className="truncate" title={file.name}>{file.name}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
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
