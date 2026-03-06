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

export async function uploadFile(courseName: string, folderName: string, formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) return { error: "No file provided" };
    if (!file.name.toLowerCase().endsWith(".pdf")) return { error: "Only PDF files are allowed" };

    try {
        const bytes = await file.arrayBuffer();
        const filePath = safePath(courseName, folderName, file.name);
        await fs.writeFile(filePath, Buffer.from(bytes));
        revalidatePath("/", "layout");
        return { success: true };
    } catch (err) {
        console.error(err);
        return { error: "Failed to upload file" };
    }
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
