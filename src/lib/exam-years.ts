/**
 * Exam Year Grouping – client-side persistence via localStorage.
 *
 * Shape stored per course:
 *   { "2023": ["20230615.pdf", "appello_2023_giugno.pdf"], "2022": [...], ... }
 *
 * Files not listed in any year bucket fall into a synthetic "Unknown" group.
 */

export type YearMap = Record<string, string[]>; // year label → file names

const STORAGE_KEY = (courseName: string) => `exam-years::${courseName}`;

/** Try to guess the year from a filename (first 4-digit year found). */
export function guessYear(filename: string): string | null {
    // Pattern 1: YYYYMMDD.pdf  (e.g. 20230615.pdf)
    const fullDate = filename.match(/^(\d{4})\d{2}\d{2}\.pdf$/i);
    if (fullDate) return fullDate[1];

    // Pattern 2: any standalone 4-digit year between 1990–2099
    const standalone = filename.match(/(?<![0-9])(19[0-9]{2}|20[0-9]{2})(?![0-9])/);
    if (standalone) return standalone[1];

    return null;
}

/** Load the stored YearMap for a course; returns null if nothing stored. */
export function loadYearMap(courseName: string): YearMap | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY(courseName));
        if (!raw) return null;
        return JSON.parse(raw) as YearMap;
    } catch {
        return null;
    }
}

/** Persist the YearMap for a course. */
export function saveYearMap(courseName: string, map: YearMap): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY(courseName), JSON.stringify(map));
}

/**
 * Build an initial YearMap by auto-guessing years for every file.
 * Files that can't be guessed land in "Unknown".
 */
export function buildInitialYearMap(fileNames: string[]): YearMap {
    const map: YearMap = {};
    for (const name of fileNames) {
        const year = guessYear(name) ?? "Unknown";
        if (!map[year]) map[year] = [];
        map[year].push(name);
    }
    return map;
}

/**
 * Merge a stored YearMap with the current file list:
 *   - Removes references to files that no longer exist.
 *   - Appends newly discovered files to their auto-guessed year (or "Unknown").
 */
export function mergeYearMap(stored: YearMap, currentFileNames: string[]): YearMap {
    const currentSet = new Set(currentFileNames);

    // Clean up stale entries
    const cleaned: YearMap = {};
    for (const [year, files] of Object.entries(stored)) {
        const valid = files.filter((f) => currentSet.has(f));
        if (valid.length > 0) cleaned[year] = valid;
    }

    // Find files not yet assigned
    const assigned = new Set(Object.values(cleaned).flat());
    const unassigned = currentFileNames.filter((f) => !assigned.has(f));

    for (const name of unassigned) {
        const year = guessYear(name) ?? "Unknown";
        if (!cleaned[year]) cleaned[year] = [];
        cleaned[year].push(name);
    }

    return cleaned;
}

/** Return sorted year labels: numeric years descending, then "Unknown" last. */
export function sortedYearKeys(map: YearMap): string[] {
    const keys = Object.keys(map);
    return keys.sort((a, b) => {
        if (a === "Unknown") return 1;
        if (b === "Unknown") return -1;
        return parseInt(b) - parseInt(a); // descending
    });
}
