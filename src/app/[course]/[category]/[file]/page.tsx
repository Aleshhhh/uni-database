import { notFound } from "next/navigation";
import PDFViewerWrapper from "@/components/pdf-viewer-wrapper";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function DocumentPage({
    params,
}: {
    params: Promise<{ course: string; category: string; file: string }>;
}) {
    const { course, category, file } = await params;
    if (!course || !category || !file) return notFound();

    const fileUrl = `/api/file/${encodeURIComponent(decodeURIComponent(course))}/${encodeURIComponent(decodeURIComponent(category))}/${encodeURIComponent(decodeURIComponent(file))}`;
    const decodedCourse = decodeURIComponent(course);
    const decodedCategory = decodeURIComponent(category);
    const decodedFile = decodeURIComponent(file);

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col">
            {/* Slim top bar */}
            <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
                <Link
                    href="/"
                    className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
                <div className="h-4 w-px bg-zinc-700" />
                <span className="text-xs text-zinc-500">{decodedCourse}</span>
                <span className="text-zinc-700">/</span>
                <span className="text-xs text-zinc-500">{decodedCategory}</span>
                <span className="text-zinc-700">/</span>
                <span className="text-xs text-zinc-300 font-medium truncate max-w-xs">{decodedFile}</span>
            </div>
            <div className="flex-1">
                <PDFViewerWrapper url={fileUrl} />
            </div>
        </div>
    );
}
