import { Document, Page } from 'react-pdf';
import { useState } from 'react';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

export default function PDFViewer() {
  const [file, setFile] = useState('/sample.pdf'); // put a test PDF in /public

  return (
    <div>
      <Document file={file}>
        <Page pageNumber={1} />
      </Document>
    </div>
  );
}
