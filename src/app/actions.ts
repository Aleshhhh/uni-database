"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export async function syncDataDir() {
    revalidatePath("/", "layout");
}

export async function createCourse(formData: FormData) {
    const name = formData.get("name") as string;
    if (!name || name.trim() === "") return { error: "Name is required" };

    const coursePath = path.join(process.cwd(), "data", name.trim());

    try {
        await fs.mkdir(coursePath, { recursive: true });

        // Create default subfolders
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
    const courseName = formData.get("courseName") as string;
    const folderName = formData.get("folderName") as string;

    if (!courseName || !folderName || folderName.trim() === "") return { error: "Invalid input" };

    const folderPath = path.join(process.cwd(), "data", courseName, folderName.trim());

    try {
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
    if (!file) {
        return { error: "No file provided" };
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
        return { error: "Only PDF files are allowed" };
    }

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filePath = path.join(process.cwd(), "data", courseName, folderName, file.name);
        await fs.writeFile(filePath, buffer);

        revalidatePath("/", "layout");
        return { success: true };
    } catch (err) {
        console.error(err);
        return { error: "Failed to upload file" };
    }
}
