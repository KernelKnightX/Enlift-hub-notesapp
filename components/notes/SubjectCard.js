// components/notes/PdfViewer.js
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// react-pdf needs to run only on the client in Next.js
const ReactPDF = dynamic(() => import("react-pdf"), { ssr: false });

export default function PdfViewer({ file = "/sample.pdf" }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(600);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);

  // set pdf.js worker (safe for client)
  useEffect(() => {
    if (!ReactPDF?.pdfjs) return;
    ReactPDF.pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${ReactPDF.pdfjs.version}/pdf.worker.min.js`;
  }, []);

  // auto-fit page width to container
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width);
      setWidth(Math.max(320, w - 16)); // padding
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const canPrev = pageNumber > 1;
  const canNext = numPages && pageNumber < numPages;

  const pageWidth = Math.floor(width * zoom);

  return (
    <div className="w-full h-full flex flex-col" ref={containerRef}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded border disabled:opacity-50"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={!canPrev}
          >
            ◀ Prev
          </button>
          <button
            className="px-2 py-1 rounded border disabled:opacity-50"
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={!canNext}
          >
            Next ▶
          </button>
          <span className="text-sm opacity-80">
            Page {pageNumber} {numPages ? `of ${numPages}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded border"
            onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))}
          >
            −
          </button>
          <span className="text-sm opacity-80">{Math.round(zoom * 100)}%</span>
          <button
            className="px-2 py-1 rounded border"
            onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))}
          >
            +
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="flex-1 overflow-auto p-2">
        {ReactPDF && (
          <ReactPDF.Document file={file} onLoadSuccess={onDocumentLoadSuccess} loading={<div className="p-4">Loading PDF…</div>}>
            <ReactPDF.Page pageNumber={pageNumber} width={pageWidth} />
          </ReactPDF.Document>
        )}
      </div>
    </div>
  );
}
