"use client";

import { useState, useTransition } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FolderPlus, Upload } from "lucide-react";
import { createCourse, createFolder, uploadFile } from "@/app/actions";

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

// ─── Upload File to a Folder ──────────────────────────────────────────────────
export function UploadFileDialog({ courseName, folderName }: { courseName: string; folderName: string }) {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState("");

    const boundUpload = uploadFile.bind(null, courseName, folderName);

    async function handleSubmit(fd: FormData) {
        setError("");
        startTransition(async () => {
            const res = await boundUpload(fd);
            if (res?.error) setError(res.error);
            else setOpen(false);
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError(""); }}>
            <DialogTrigger asChild>
                <button
                    onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                    className="p-0.5 rounded opacity-0 group-hover/folder:opacity-100 transition-opacity hover:bg-accent"
                    title="Upload PDF"
                >
                    <Upload className="w-3 h-3" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Upload to {courseName} / {folderName}</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="file-upload">PDF file</Label>
                        <Input id="file-upload" name="file" type="file" accept=".pdf" required />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <DialogFooter>
                        <Button type="submit" disabled={pending}>
                            {pending ? "Uploading…" : "Upload"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
