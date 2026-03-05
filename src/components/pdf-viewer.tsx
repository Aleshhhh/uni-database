"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ url }: { url: string }) {
    const [numPages, setNumPages] = useState<number>();

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div className="flex flex-col items-center bg-zinc-100 dark:bg-zinc-900 min-h-screen py-8">
            <div className="max-w-4xl shadow-2xl rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <Document file={url} onLoadSuccess={onDocumentLoadSuccess} className="flex flex-col items-center max-w-full">
                    {numPages && Array.from(new Array(numPages), (el, index) => (
                        <div key={`page_${index + 1}`} className="mb-4">
                            <Page
                                pageNumber={index + 1}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                width={Math.min(window.innerWidth * 0.9, 1000)}
                                className="max-w-full print:max-w-none"
                            />
                        </div>
                    ))}
                </Document>
            </div>
        </div>
    );
}
