import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export type FileItem = {
    name: string;
    path: string; // url friendly path component
};

export type CourseFolders = Record<string, FileItem[]>;

export async function getCourses(): Promise<string[]> {
    try {
        await fs.mkdir(dataDir, { recursive: true });
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
    const folders: Record<string, FileItem[]> = {};
    const coursePath = path.join(dataDir, courseName);

    try {
        const courseEntries = await fs.readdir(coursePath, { withFileTypes: true });
        const directories = courseEntries.filter(entry => entry.isDirectory()).map(entry => entry.name);

        for (const folder of directories) {
            const folderPath = path.join(coursePath, folder);
            try {
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
    } catch {
        // course directory might not exist
    }

    return folders;
}
