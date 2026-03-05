import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export type FileItem = {
    name: string;
    path: string; // url friendly path component
};

export type CourseFolders = {
    slides: FileItem[];
    exams: FileItem[];
    other: FileItem[];
};

export async function getCourses(): Promise<string[]> {
    try {
        const entries = await fs.readdir(dataDir, { withFileTypes: true });
        return entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort((a, b) => a.localeCompare(b));
    } catch (err) {
        console.error("Failed to read courses:", err);
        return [];
    }
}

export async function getCourseContent(courseName: string): Promise<CourseFolders> {
    const folders: CourseFolders = { slides: [], exams: [], other: [] };
    const coursePath = path.join(dataDir, courseName);

    for (const folder of ["slides", "exams", "other"] as const) {
        try {
            const folderPath = path.join(coursePath, folder);
            const entries = await fs.readdir(folderPath, { withFileTypes: true });
            folders[folder] = entries
                .filter((entry) => entry.isFile() && entry.name.endsWith(".pdf"))
                .map((entry) => ({
                    name: entry.name,
                    path: encodeURIComponent(entry.name),
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
        } catch {
            // folder might not exist, silently ignore
        }
    }

    return folders;
}
