export function formatItalianDate(filename: string): string {
    const match = filename.match(/^(\d{4})(\d{2})(\d{2})\.pdf$/);
    if (!match) return filename;

    const [, year, month, day] = match;
    try {
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return new Intl.DateTimeFormat("it-IT", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
    } catch {
        return filename;
    }
}
