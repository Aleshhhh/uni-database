export function formatItalianDate(filename: string): string {
    // e.g. "20260101.pdf"
    const match = filename.match(/^(\d{4})(\d{2})(\d{2})\.pdf$/);
    if (!match) return filename; // return original if not matching

    const [, year, month, day] = match;
    try {
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

        // Format to Italian format, e.g. "1 Gennaio 2026"
        return new Intl.DateTimeFormat('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    } catch {
        return filename; // fallback
    }
}
