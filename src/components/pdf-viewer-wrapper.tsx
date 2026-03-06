"use client";

import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("@/components/pdf-viewer"), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse">Loading document…</p>
        </div>
    ),
});

export default function PDFViewerWrapper({ url }: { url: string }) {
    return <PDFViewer url={url} />;
}
