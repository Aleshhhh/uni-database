"use client";

import { useState, useTransition } from "react";
import { Book, RefreshCw } from "lucide-react";
import type { Course } from "@/lib/data";
import { reloadData } from "@/app/actions";
import { cn } from "@/lib/utils";
import { CreateCourseDialog } from "@/components/dialogs";
import { CompactCourseCard } from "@/components/compact-course-card";
import { ExpandedCourseView } from "@/components/expanded-course-view";

export const ACCENTS = [
    { border: "border-l-blue-500", ring: "ring-blue-500/30", dot: "bg-blue-500", text: "text-blue-400", tab: "text-blue-400 border-blue-400", headerBg: "bg-blue-500/8" },
    { border: "border-l-violet-500", ring: "ring-violet-500/30", dot: "bg-violet-500", text: "text-violet-400", tab: "text-violet-400 border-violet-400", headerBg: "bg-violet-500/8" },
    { border: "border-l-emerald-500", ring: "ring-emerald-500/30", dot: "bg-emerald-500", text: "text-emerald-400", tab: "text-emerald-400 border-emerald-400", headerBg: "bg-emerald-500/8" },
    { border: "border-l-amber-500", ring: "ring-amber-500/30", dot: "bg-amber-500", text: "text-amber-400", tab: "text-amber-400 border-amber-400", headerBg: "bg-amber-500/8" },
    { border: "border-l-rose-500", ring: "ring-rose-500/30", dot: "bg-rose-500", text: "text-rose-400", tab: "text-rose-400 border-rose-400", headerBg: "bg-rose-500/8" },
    { border: "border-l-cyan-500", ring: "ring-cyan-500/30", dot: "bg-cyan-500", text: "text-cyan-400", tab: "text-cyan-400 border-cyan-400", headerBg: "bg-cyan-500/8" },
    { border: "border-l-pink-500", ring: "ring-pink-500/30", dot: "bg-pink-500", text: "text-pink-400", tab: "text-pink-400 border-pink-400", headerBg: "bg-pink-500/8" },
    { border: "border-l-lime-500", ring: "ring-lime-500/30", dot: "bg-lime-500", text: "text-lime-400", tab: "text-lime-400 border-lime-400", headerBg: "bg-lime-500/8" },
];

export function WorkspaceDashboard({ courses }: { courses: Course[] }) {
    const [syncing, startSync] = useTransition();
    const [focused, setFocused] = useState<string | null>(null);

    function sync() { startSync(() => { reloadData(); }); }

    const focusedCourse = courses.find((c) => c.name === focused) ?? null;
    const focusedIndex = courses.findIndex((c) => c.name === focused);

    return (
        <div className="min-h-screen flex flex-col">
            {/* ── Header ── */}
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

            {/* ── Content ── */}
            <main className="flex-1 max-w-screen-2xl mx-auto w-full px-6 py-8">
                {courses.length === 0 ? (
                    <EmptyState />
                ) : focusedCourse ? (
                    <ExpandedCourseView
                        course={focusedCourse}
                        accent={ACCENTS[focusedIndex % ACCENTS.length]}
                        onClose={() => setFocused(null)}
                    />
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
                        {courses.map((course, i) => (
                            <div key={course.name} className="break-inside-avoid">
                                <CompactCourseCard
                                    course={course}
                                    accent={ACCENTS[i % ACCENTS.length]}
                                    onClick={() => setFocused(course.name)}
                                />
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
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Click <strong>New Course</strong> in the header to get started.
                </p>
            </div>
        </div>
    );
}
