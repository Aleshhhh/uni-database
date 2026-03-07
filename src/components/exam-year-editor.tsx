"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings2, Plus, Trash2, GripVertical, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { YearMap } from "@/lib/exam-years";
import { sortedYearKeys } from "@/lib/exam-years";

interface Props {
    courseName: string;
    yearMap: YearMap;
    allFiles: string[]; // all file names in the exams folder
    onSave: (updated: YearMap) => void;
}

export function ExamYearEditor({ courseName, yearMap, allFiles, onSave }: Props) {
    const [open, setOpen] = useState(false);
    // Local working copy
    const [draft, setDraft] = useState<YearMap>({});
    const [newYearLabel, setNewYearLabel] = useState("");
    const [expandedYear, setExpandedYear] = useState<string | null>(null);
    const [draggedFile, setDraggedFile] = useState<{ file: string; fromYear: string } | null>(null);
    const [dragOverYear, setDragOverYear] = useState<string | null>(null);

    function openEditor() {
        // Deep-clone current map as draft
        const clone: YearMap = {};
        for (const [k, v] of Object.entries(yearMap)) clone[k] = [...v];
        setDraft(clone);
        setNewYearLabel("");
        setExpandedYear(sortedYearKeys(clone)[0] ?? null);
        setOpen(true);
    }

    function addYear() {
        const label = newYearLabel.trim();
        if (!label || draft[label]) return;
        setDraft((prev) => ({ ...prev, [label]: [] }));
        setNewYearLabel("");
        setExpandedYear(label);
    }

    function deleteYear(year: string) {
        const files = draft[year] ?? [];
        if (files.length > 0) {
            // Move files to Unknown
            setDraft((prev) => {
                const next = { ...prev };
                delete next[year];
                next["Unknown"] = [...(next["Unknown"] ?? []), ...files];
                return next;
            });
        } else {
            setDraft((prev) => {
                const next = { ...prev };
                delete next[year];
                return next;
            });
        }
    }

    function renameYear(oldLabel: string, newLabel: string) {
        newLabel = newLabel.trim();
        if (!newLabel || newLabel === oldLabel || draft[newLabel] !== undefined) return;
        setDraft((prev) => {
            const next: YearMap = {};
            for (const [k, v] of Object.entries(prev)) {
                next[k === oldLabel ? newLabel : k] = v;
            }
            return next;
        });
        if (expandedYear === oldLabel) setExpandedYear(newLabel);
    }

    function moveFile(file: string, fromYear: string, toYear: string) {
        if (fromYear === toYear) return;
        setDraft((prev) => {
            const next = { ...prev };
            next[fromYear] = (next[fromYear] ?? []).filter((f) => f !== file);
            if (next[fromYear].length === 0 && fromYear !== "Unknown") delete next[fromYear];
            next[toYear] = [...(next[toYear] ?? []), file];
            return next;
        });
    }

    // Drag handlers
    function onDragStart(file: string, fromYear: string) {
        setDraggedFile({ file, fromYear });
    }
    function onDragOver(e: React.DragEvent, year: string) {
        e.preventDefault();
        setDragOverYear(year);
    }
    function onDrop(e: React.DragEvent, toYear: string) {
        e.preventDefault();
        if (draggedFile) moveFile(draggedFile.file, draggedFile.fromYear, toYear);
        setDraggedFile(null);
        setDragOverYear(null);
    }
    function onDragEnd() {
        setDraggedFile(null);
        setDragOverYear(null);
    }

    const years = sortedYearKeys(draft);
    // Files not in any year (should be empty after merge, but kept as safety net)
    const assignedFiles = new Set(Object.values(draft).flat());
    const unassigned = allFiles.filter((f) => !assignedFiles.has(f));

    function handleSave() {
        // Remove years with zero files (except Unknown if user wants to keep it)
        const cleaned: YearMap = {};
        for (const [k, v] of Object.entries(draft)) {
            if (v.length > 0) cleaned[k] = v;
        }
        // unassigned files go to Unknown
        if (unassigned.length > 0) {
            cleaned["Unknown"] = [...(cleaned["Unknown"] ?? []), ...unassigned];
        }
        onSave(cleaned);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (v) openEditor(); else setOpen(false); }}>
            <DialogTrigger asChild>
                <button
                    className="h-8 px-3 rounded-md text-xs font-medium flex items-center gap-1.5 border border-border bg-background/40 hover:bg-background/70 text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit year groupings for exams"
                >
                    <Settings2 className="w-3.5 h-3.5" />
                    Edit Years
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Exam Year Groups — {courseName}</DialogTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        Drag files between years, rename or delete groups. Changes are saved client-side only.
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
                    {years.map((year) => {
                        const files = draft[year] ?? [];
                        const isExpanded = expandedYear === year;
                        const isDropTarget = dragOverYear === year;

                        return (
                            <div
                                key={year}
                                className={cn(
                                    "border rounded-lg overflow-hidden transition-colors",
                                    isDropTarget ? "border-primary bg-primary/5" : "border-border"
                                )}
                                onDragOver={(e) => onDragOver(e, year)}
                                onDrop={(e) => onDrop(e, year)}
                            >
                                {/* Year header */}
                                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30">
                                    <button
                                        onClick={() => setExpandedYear(isExpanded ? null : year)}
                                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                    >
                                        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform", isExpanded && "rotate-180")} />
                                        <YearLabelInput
                                            value={year}
                                            onRename={(newVal) => renameYear(year, newVal)}
                                        />
                                        <span className="text-xs text-muted-foreground ml-auto shrink-0">{files.length} file{files.length !== 1 ? "s" : ""}</span>
                                    </button>
                                    {year !== "Unknown" && (
                                        <button
                                            onClick={() => deleteYear(year)}
                                            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10"
                                            title="Delete year group (files move to Unknown)"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* File list */}
                                {isExpanded && (
                                    <div className="px-3 py-2 space-y-1">
                                        {files.length === 0 ? (
                                            <p className="text-xs text-muted-foreground italic py-1">
                                                Drop files here or they will be removed on save
                                            </p>
                                        ) : (
                                            files.map((file) => (
                                                <div
                                                    key={file}
                                                    draggable
                                                    onDragStart={() => onDragStart(file, year)}
                                                    onDragEnd={onDragEnd}
                                                    className={cn(
                                                        "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs bg-background border border-border",
                                                        "cursor-grab active:cursor-grabbing select-none",
                                                        "hover:border-primary/40 transition-colors",
                                                        draggedFile?.file === file && "opacity-40"
                                                    )}
                                                >
                                                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                    <span className="flex-1 truncate" title={file}>{file}</span>
                                                    {/* Quick-move select */}
                                                    <select
                                                        value={year}
                                                        onChange={(e) => moveFile(file, year, e.target.value)}
                                                        className="text-xs border border-border rounded px-1 py-0.5 bg-background text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 shrink-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                        title="Move to year"
                                                    >
                                                        {years.map((y) => (
                                                            <option key={y} value={y}>{y}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Unassigned safety section */}
                    {unassigned.length > 0 && (
                        <div className="border border-dashed border-border rounded-lg px-3 py-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Unassigned files</p>
                            {unassigned.map((file) => (
                                <div key={file} className="flex items-center gap-2 text-xs py-0.5">
                                    <span className="flex-1 truncate text-muted-foreground">{file}</span>
                                    <select
                                        defaultValue=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setDraft((prev) => {
                                                    const next = { ...prev };
                                                    next[e.target.value] = [...(next[e.target.value] ?? []), file];
                                                    return next;
                                                });
                                            }
                                        }}
                                        className="text-xs border border-border rounded px-1 py-0.5 bg-background"
                                    >
                                        <option value="" disabled>Move to…</option>
                                        {years.map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add year */}
                    <div className="flex gap-2 pt-1">
                        <Input
                            value={newYearLabel}
                            onChange={(e) => setNewYearLabel(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addYear(); } }}
                            placeholder="New year label (e.g. 2024)"
                            className="h-8 text-xs"
                        />
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={addYear}
                            disabled={!newYearLabel.trim()}
                            className="shrink-0 h-8 px-3"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add
                        </Button>
                    </div>
                </div>

                <DialogFooter className="pt-2 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleSave}>Save groupings</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/** Inline editable year label — double-click to rename */
function YearLabelInput({ value, onRename }: { value: string; onRename: (v: string) => void }) {
    const [editing, setEditing] = useState(false);
    const [local, setLocal] = useState(value);

    function commit() {
        setEditing(false);
        if (local.trim() && local.trim() !== value) onRename(local.trim());
        else setLocal(value);
    }

    if (editing) {
        return (
            <input
                autoFocus
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); commit(); }
                    if (e.key === "Escape") { setLocal(value); setEditing(false); }
                    e.stopPropagation();
                }}
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-semibold bg-transparent border-b border-primary outline-none w-24 shrink-0"
            />
        );
    }

    return (
        <span
            className="text-sm font-semibold"
            onDoubleClick={(e) => { e.stopPropagation(); setLocal(value); setEditing(true); }}
            title="Double-click to rename"
        >
            {value}
        </span>
    );
}
