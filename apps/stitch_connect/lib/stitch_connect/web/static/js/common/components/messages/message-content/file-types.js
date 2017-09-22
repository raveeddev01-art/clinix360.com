export const FILE_TYPES = [
  {
    title: "Image",
    icon: "fa fa-file-image-o",
    types: /^image\/.+/
  },
  {
    title: "Audio File",
    icon: "fa fa-file-audio-o",
    types: /^audio\/.+/
  },
  {
    title: "Video File",
    icon: "fa fa-file-video-o",
    types: /^video\/.+/
  },
  {
    title: "PDF Document",
    icon: "fa fa-file-pdf-o",
    types: ["application/pdf"]
  },
  {
    title: "Archive",
    icon: "fa fa-file-archive-o",
    types: ["application/x-rar-compressed", "application/zip"]
  },
  {
    title: "Text Document",
    icon: "fa fa-file-text-o",
    types: ["text/plain"]
  },
  {
    title: "Word Document",
    icon: "fa fa-file-word-o",
    types: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
  },
  {
    title: "Excel Document",
    icon: "fa fa-file-excel-o",
    types: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ]
  },
  {
    title: "PowerPoint Presentation",
    icon: "fa fa-file-powerpoint-o",
    types: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ]
  }
];

const FALLBACK_FILE_TYPE = {
  title: "File",
  icon: "fa fa-file-o"
};

export default function getFiletype(mimeType) {
  const fileType = FILE_TYPES.find(item => {
    if (item.types instanceof RegExp) {
      return item.types.test(mimeType);
    }

    return item.types.indexOf(mimeType) > -1;
  });

  return fileType || FALLBACK_FILE_TYPE;
}
