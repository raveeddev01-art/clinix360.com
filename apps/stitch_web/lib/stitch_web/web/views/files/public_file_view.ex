defmodule Stitch.Web.Files.PublicFileView do
  use Stitch.Web, :view

  @filetypes [
    %{
      title: "File",
      icon: "fa fa-file-o",
      types: ~r/tiff?$/
    },
    %{
      title: "Image",
      icon: "fa fa-file-image-o",
      types: ~r/^image\/.+/
    },
    %{
      title: "Audio File",
      icon: "fa fa-file-audio-o",
      types: ~r/^audio\/.+/
    },
    %{
      title: "Video File",
      icon: "fa fa-file-video-o",
      types: ~r/^video\/.+/
    },
    %{
      title: "PDF Document",
      icon: "fa fa-file-pdf-o",
      types: ["application/pdf"]
    },
    %{
      title: "Archive",
      icon: "fa fa-file-archive-o",
      types: ["application/x-rar-compressed", "application/zip"]
    },
    %{
      title: "Text Document",
      icon: "fa fa-file-text-o",
      types: ["text/plain"]
    },
    %{
      title: "Word Document",
      icon: "fa fa-file-word-o",
      types: [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ]
    },
    %{
      title: "Excel Document",
      icon: "fa fa-file-excel-o",
      types: [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ]
    },
    %{
      title: "PowerPoint Presentation",
      icon: "fa fa-file-powerpoint-o",
      types: [
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ]
    }
  ]

  @fallback_filetype %{
    title: "File",
    icon: "fa fa-file-o"
  }

  def get_filetype_icon(upload) do
    get_filetype(upload.mimetype).icon
  end

  def get_filetype(mimetype) do
    filetype =
      Enum.find(@filetypes, fn filetype ->
        if Regex.regex?(filetype.types) do
          Regex.match?(filetype.types, mimetype)
        end
      end)

    filetype || @fallback_filetype
  end
end
