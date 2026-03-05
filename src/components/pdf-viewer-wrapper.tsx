"use client";

import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("./pdf-viewer"), {
    ssr: false,
    loading: () => (
        <div className="flex-1 flex flex-col items-center justify-center h-full space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground animate-pulse">Loading Document...</p>
        </div>
    ),
});

export default function PDFViewerWrapper({ url }: { url: string }) {
    return <PDFViewer url={url} />;
}
