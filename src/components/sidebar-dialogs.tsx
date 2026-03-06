"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Upload, FolderPlus } from "lucide-react";
import { createCourse, createFolder, uploadFile } from "@/app/actions";

export function CreateCourseDialog() {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function action(formData: FormData) {
        startTransition(async () => {
            const result = await createCourse(formData);
            if (result?.error) {
                alert(result.error);
            } else {
                setOpen(false);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="outline" title="Create Course">
                    <Plus className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Course</DialogTitle>
                </DialogHeader>
                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Course Name</Label>
                        <Input id="name" name="name" required placeholder="e.g. Mathematics" />
                    </div>
                    <Button type="submit" disabled={isPending}>Create</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function CreateFolderDialog({ courseName }: { courseName: string }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function action(formData: FormData) {
        startTransition(async () => {
            const result = await createFolder(formData);
            if (result?.error) {
                alert(result.error);
            } else {
                setOpen(false);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()} title="Add Folder">
                    <FolderPlus className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Add Folder to {courseName}</DialogTitle>
                </DialogHeader>
                <form action={action} className="space-y-4">
                    <input type="hidden" name="courseName" value={courseName} />
                    <div className="space-y-2">
                        <Label htmlFor="folderName">Folder Name</Label>
                        <Input id="folderName" name="folderName" required placeholder="e.g. Exercises" />
                    </div>
                    <Button type="submit" disabled={isPending}>Add Folder</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function UploadFileDialog({ courseName, folderName }: { courseName: string, folderName: string }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const boundAction = uploadFile.bind(null, courseName, folderName);

    async function action(formData: FormData) {
        startTransition(async () => {
            const result = await boundAction(formData);
            if (result?.error) {
                alert(result.error);
            } else {
                setOpen(false);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()} title="Upload File">
                    <Upload className="w-3.5 h-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Upload File to {folderName}</DialogTitle>
                </DialogHeader>
                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="file">File (PDF only)</Label>
                        <Input id="file" name="file" type="file" required accept=".pdf" />
                    </div>
                    <Button type="submit" disabled={isPending}>Upload</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
