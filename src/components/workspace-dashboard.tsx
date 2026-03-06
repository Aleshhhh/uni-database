"use client";

import { useTransition } from "react";
import { Book, RefreshCw } from "lucide-react";
import type { Course } from "@/lib/data";
import { reloadData } from "@/app/actions";
import { cn } from "@/lib/utils";
import { CreateCourseDialog } from "@/components/dialogs";
import { CourseCard } from "@/components/course-card";

export function WorkspaceDashboard({ courses }: { courses: Course[] }) {
    const [syncing, startSync] = useTransition();

    function sync() {
        startSync(() => { reloadData(); });
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 font-semibold text-sm tracking-tight">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                            <Book className="w-4 h-4 text-primary-foreground" />
                        </div>
                        Uni Portal
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={sync}
                            disabled={syncing}
                            className="h-8 px-3 rounded-md text-xs font-medium flex items-center gap-1.5 border border-border bg-card hover:bg-accent transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", syncing && "animate-spin")} />
                            Sync
                        </button>
                        <CreateCourseDialog />
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 max-w-screen-2xl mx-auto w-full px-6 py-8">
                {courses.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
                        {courses.map((course, i) => (
                            <div key={course.name} className="break-inside-avoid">
                                <CourseCard course={course} accentIndex={i} />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center">
                <Book className="w-9 h-9 text-muted-foreground" />
            </div>
            <div>
                <h2 className="text-lg font-semibold">No courses yet</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Click <strong>+ New Course</strong> in the header to get started.
                </p>
            </div>
        </div>
    );
}
