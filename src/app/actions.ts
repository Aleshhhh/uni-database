"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { dataDir } from "@/lib/data";

function safePath(...parts: string[]): string {
    const resolved = path.join(dataDir, ...parts);
    if (!resolved.startsWith(dataDir)) throw new Error("Path traversal detected");
    return resolved;
}

export async function reloadData() {
    revalidatePath("/", "layout");
}

export async function createCourse(formData: FormData) {
    const name = (formData.get("name") as string)?.trim();
    if (!name) return { error: "Name is required" };

    try {
        const coursePath = safePath(name);
        await fs.mkdir(path.join(coursePath, "slides"), { recursive: true });
        await fs.mkdir(path.join(coursePath, "exams"), { recursive: true });
        await fs.mkdir(path.join(coursePath, "other"), { recursive: true });
        revalidatePath("/", "layout");
        return { success: true };
    } catch (err) {
        console.error(err);
        return { error: "Failed to create course" };
    }
}

export async function createFolder(formData: FormData) {
    const courseName = (formData.get("courseName") as string)?.trim();
    const folderName = (formData.get("folderName") as string)?.trim();
    if (!courseName || !folderName) return { error: "Invalid input" };

    try {
        const folderPath = safePath(courseName, folderName);
        await fs.mkdir(folderPath, { recursive: true });
        revalidatePath("/", "layout");
        return { success: true };
    } catch (err) {
        console.error(err);
        return { error: "Failed to create folder" };
    }
}

export async function uploadFiles(courseName: string, folderName: string, formData: FormData) {
    const files = formData.getAll("files") as File[];
    if (!files.length) return { error: "No files provided" };

    const errors: string[] = [];

    for (const file of files) {
        if (!file.name.toLowerCase().endsWith(".pdf")) {
            errors.push(`${file.name}: only PDF files are allowed`);
            continue;
        }
        try {
            const bytes = await file.arrayBuffer();
            const filePath = safePath(courseName, folderName, file.name);
            await fs.writeFile(filePath, Buffer.from(bytes));
        } catch (err) {
            console.error(err);
            errors.push(`${file.name}: failed to write`);
        }
    }

    revalidatePath("/", "layout");
    if (errors.length) return { error: errors.join("\n") };
    return { success: true };
}

export async function deleteFile(courseName: string, folderName: string, fileName: string) {
    try {
        const filePath = safePath(courseName, folderName, fileName);
        await fs.unlink(filePath);
        revalidatePath("/", "layout");
        return { success: true };
    } catch (err) {
        console.error(err);
        return { error: "Failed to delete file" };
    }
}
