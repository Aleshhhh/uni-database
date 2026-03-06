"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ url }: { url: string }) {
    const [numPages, setNumPages] = useState<number>();

    return (
        <div className="flex flex-col items-center py-8 px-4 min-h-screen bg-zinc-900">
            <div className="w-full max-w-4xl shadow-2xl rounded-lg overflow-hidden border border-zinc-800">
                <Document
                    file={url}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    className="flex flex-col items-center"
                >
                    {numPages &&
                        Array.from({ length: numPages }, (_, i) => (
                            <div key={i} className="mb-1">
                                <Page
                                    pageNumber={i + 1}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    width={Math.min(typeof window !== "undefined" ? window.innerWidth * 0.9 : 900, 1000)}
                                />
                            </div>
                        ))}
                </Document>
            </div>
        </div>
    );
}
