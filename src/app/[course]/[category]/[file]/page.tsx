import { notFound } from "next/navigation";
import PDFViewerWrapper from "@/components/pdf-viewer-wrapper";

export default async function DocumentPage({
    params,
}: {
    params: Promise<{ course: string; category: string; file: string }>;
}) {
    const { course, category, file } = await params;
    if (!course || !category || !file) return notFound();

    const fileUrl = `/api/file/${encodeURIComponent(decodeURIComponent(course))}/${encodeURIComponent(decodeURIComponent(category))}/${encodeURIComponent(decodeURIComponent(file))}`;

    return (
        <div className="h-screen overflow-y-auto">
            <PDFViewerWrapper url={fileUrl} />
        </div>
    );
}
