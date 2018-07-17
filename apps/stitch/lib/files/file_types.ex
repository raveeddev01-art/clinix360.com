defmodule Stitch.Files.FileTypes do
  @images [
    "bmp",
    "gif",
    "jpg",
    "jpeg",
    "png",
    "tiff",
    "svg+xml",
    "vnd.wap.wbmp",
    "webp",
    "x-jng"
  ]

  @videos [
    "3g2",
    "3gp",
    "aaf",
    "asf",
    "avchd",
    "avi",
    "drc",
    "flv",
    "m2v",
    "m4p",
    "m4v",
    "mkv",
    "mng",
    "mov",
    "mp2",
    "mp4",
    "mpe",
    "mpeg",
    "mpg",
    "mpv",
    "mxf",
    "nsv",
    "ogg",
    "ogv",
    "ogm",
    "qt",
    "webm",
    "wmv",
    "quicktime",
    "x-flv"
  ]

  @audio [
    "aac",
    "aiff",
    "ape",
    "au",
    "flac",
    "gsm",
    "it",
    "m4a",
    "mp3",
    "wav",
    "wma",
    "wav",
    "wave",
    "x-wav",
    "x-pn-wav",
    "midi",
    "mp4",
    "mpeg",
    "ogg",
    "x-realaudio",
    "x-wav"
  ]

  @archive [
    "zip",
    "x-7z-compressed",
    "x-bzip",
    "x-bzip2",
    "x-rar-compressed",
    "x-tar"
  ]

  @text [
    "msword",
    "vnd.openxmlformats-officedocument.wordprocessingml.document",
    "epub+zip",
    "log",
    "markdwon",
    "vnd.oasis.opendocument.text",
    "vnd.oasis.opendocument.spreadsheet",
    "vnd.ms-excel",
    "json",
    "org",
    "pages",
    "pdf",
    "rtf",
    "tex",
    "txt",
    "wpd",
    "wps"
  ]

  def images, do: @images
  def videos, do: @videos
  def audio, do: @audio
  def archive, do: @archive
  def text, do: @text
end
