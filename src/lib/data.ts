import fs from "fs/promises";
import path from "path";

export const dataDir = path.join(process.cwd(), "data");

export type FileItem = {
    name: string;
    encodedName: string; // url-safe
};

export type CourseFolder = {
    name: string;
    files: FileItem[];
};

export type Course = {
    name: string;
    folders: CourseFolder[];
};

export async function getCourses(): Promise<Course[]> {
    try {
        await fs.mkdir(dataDir, { recursive: true });
        const entries = await fs.readdir(dataDir, { withFileTypes: true });
        const courseNames = entries
            .filter((e) => e.isDirectory())
            .map((e) => e.name)
            .sort((a, b) => a.localeCompare(b));

        return Promise.all(courseNames.map(getCourse));
    } catch (err) {
        console.error("Failed to read courses:", err);
        return [];
    }
}

export async function getCourse(courseName: string): Promise<Course> {
    const coursePath = path.join(dataDir, courseName);
    const folders: CourseFolder[] = [];

    try {
        const entries = await fs.readdir(coursePath, { withFileTypes: true });
        const folderNames = entries
            .filter((e) => e.isDirectory())
            .map((e) => e.name)
            .sort((a, b) => a.localeCompare(b));

        for (const folderName of folderNames) {
            const folderPath = path.join(coursePath, folderName);
            try {
                const fileEntries = await fs.readdir(folderPath, { withFileTypes: true });
                const files: FileItem[] = fileEntries
                    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".pdf"))
                    .map((e) => ({ name: e.name, encodedName: encodeURIComponent(e.name) }))
                    .sort((a, b) => a.name.localeCompare(b.name));
                folders.push({ name: folderName, files });
            } catch {
                // skip unreadable folders
            }
        }
    } catch {
        // course not found
    }

    return { name: courseName, folders };
}
