import { notFound } from "next/navigation";
import PDFViewerWrapper from "@/components/pdf-viewer-wrapper";

export default async function DocumentPage({
    params,
}: {
    params: Promise<{ course: string; category: string; file: string }>;
}) {
    const resolvedParams = await params;

    if (!resolvedParams.course || !resolvedParams.category || !resolvedParams.file) {
        return notFound();
    }

    const decodeCourse = decodeURIComponent(resolvedParams.course);
    const decodeFile = decodeURIComponent(resolvedParams.file);
    const fileUrl = `/api/file/${encodeURIComponent(decodeCourse)}/${encodeURIComponent(resolvedParams.category)}/${encodeURIComponent(decodeFile)}`;

    return (
        <div className="flex-1 h-screen overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800">
            <div className="h-full overflow-y-auto w-full flex items-center justify-center">
                <PDFViewerWrapper url={fileUrl} />
            </div>
        </div>
    );
}
