import ImageViewer from "./image-viewer";
import PdfViewer from "./pdf-viewer";
import DocxViewer from "./docx-viewer";
import ExcelViewer from "./excel-viewer";
import VideoViewer from "./video-viewer";

export default {
  Image: ImageViewer,
  "PDF Document": PdfViewer,
  "Word Document": DocxViewer,
  "Excel Document": ExcelViewer,
  "Video File": VideoViewer
};
