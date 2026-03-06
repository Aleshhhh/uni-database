"use client";

import { useRef, useState, useTransition } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, FolderPlus, Upload, X, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createCourse, createFolder, uploadFiles } from "@/app/actions";

// ─── Create Course ───────────────────────────────────────────────────────────
export function CreateCourseDialog() {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState("");

    async function handleSubmit(fd: FormData) {
        setError("");
        startTransition(async () => {
            const res = await createCourse(fd);
            if (res?.error) setError(res.error);
            else setOpen(false);
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError(""); }}>
            <DialogTrigger asChild>
                <Button size="icon" variant="outline" title="Create new course">
                    <Plus className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Create Course</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="course-name">Course name</Label>
                        <Input id="course-name" name="name" required placeholder="e.g. Linear Algebra" autoFocus />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <DialogFooter>
                        <Button type="submit" disabled={pending}>
                            {pending ? "Creating…" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Add Folder to Course ─────────────────────────────────────────────────────
export function CreateFolderDialog({ courseName }: { courseName: string }) {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState("");

    async function handleSubmit(fd: FormData) {
        setError("");
        startTransition(async () => {
            const res = await createFolder(fd);
            if (res?.error) setError(res.error);
            else setOpen(false);
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError(""); }}>
            <DialogTrigger asChild>
                <button
                    onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
                    title="Add folder"
                >
                    <FolderPlus className="w-3.5 h-3.5" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Add folder — {courseName}</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="courseName" value={courseName} />
                    <div className="space-y-1.5">
                        <Label htmlFor="folder-name">Folder name</Label>
                        <Input id="folder-name" name="folderName" required placeholder="e.g. exercises" autoFocus />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <DialogFooter>
                        <Button type="submit" disabled={pending}>
                            {pending ? "Creating…" : "Add Folder"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Upload Files to a Folder ────────────────────────────────────────────────
export function UploadFileDialog({ courseName, folderName }: { courseName: string; folderName: string }) {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const boundUpload = uploadFiles.bind(null, courseName, folderName);

    function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        setSelectedFiles((prev) => {
            const existingNames = new Set(prev.map((f) => f.name));
            return [...prev, ...files.filter((f) => !existingNames.has(f.name))];
        });
        // reset <input> so the same file can be re-picked after removal
        e.target.value = "";
    }

    function removeFile(name: string) {
        setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedFiles.length) return;
        setError("");
        const fd = new FormData();
        for (const file of selectedFiles) fd.append("files", file);
        startTransition(async () => {
            const res = await boundUpload(fd);
            if (res?.error) setError(res.error);
            else { setOpen(false); setSelectedFiles([]); }
        });
    }

    function handleOpenChange(v: boolean) {
        setOpen(v);
        if (!v) { setSelectedFiles([]); setError(""); }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button
                    onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                    className="p-0.5 rounded opacity-0 group-hover/folder:opacity-100 transition-opacity hover:bg-accent"
                    title="Upload PDFs"
                >
                    <Upload className="w-3 h-3" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Upload to {courseName} / {folderName}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Drop zone / pick button */}
                    <div className="space-y-1.5">
                        <Label>PDF files</Label>
                        <div
                            className="border-2 border-dashed border-border rounded-lg px-4 py-6 text-center cursor-pointer hover:border-primary transition-colors"
                            onClick={() => inputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const files = Array.from(e.dataTransfer.files);
                                setSelectedFiles((prev) => {
                                    const existingNames = new Set(prev.map((f) => f.name));
                                    return [...prev, ...files.filter((f) => !existingNames.has(f.name))];
                                });
                            }}
                        >
                            <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                Click to browse or drag & drop PDFs here
                            </p>
                        </div>
                        <Input
                            ref={inputRef}
                            type="file"
                            accept=".pdf"
                            multiple
                            className="hidden"
                            onChange={handleFilesChange}
                        />
                    </div>

                    {/* Selected file list */}
                    {selectedFiles.length > 0 && (
                        <ul className="space-y-1 max-h-40 overflow-y-auto pr-1">
                            {selectedFiles.map((f) => (
                                <li key={f.name} className="flex items-center gap-2 text-xs bg-muted rounded-md px-2 py-1">
                                    <FileText className="w-3.5 h-3.5 shrink-0 text-primary" />
                                    <span className="flex-1 truncate" title={f.name}>{f.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(f.name)}
                                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {error && <p className="text-sm text-destructive whitespace-pre-wrap">{error}</p>}

                    <DialogFooter>
                        <Button type="submit" disabled={pending || selectedFiles.length === 0}>
                            {pending
                                ? "Uploading…"
                                : selectedFiles.length > 0
                                    ? `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""}`
                                    : "Upload"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
