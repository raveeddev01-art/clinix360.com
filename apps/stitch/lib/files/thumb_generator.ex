defmodule Stitch.Files.ThumbGenerator do
  import Librex

  alias Stitch.{
    Rand
  }

  @settings Application.get_env(:stitch, :user_upload_settings)

  def generate_pdf_thumbnail(target_pdf) do
    thumb_name = String.downcase(Rand.token(32))
    image_path = System.tmp_dir!() |> Path.join("#{thumb_name}-thumb.png")

    result =
      System.cmd("convert", [
        "-thumbnail",
        "x#{@settings.max_preview_height}",
        "-background",
        "white",
        "-colorspace",
        "RGB",
        "#{target_pdf}[0]",
        image_path
      ])

    with {_, 0} <- result do
      {:ok, image_path}
    else
      error ->
        {:error, error}
    end
  end

  def generate_document_thumbnail(target_doc) do
    with thumb_name <- String.downcase(Rand.token(32)),
         pdf_path <- System.tmp_dir!() |> Path.join("#{thumb_name}-thumb.pdf"),
         {:ok, _filepath} <- convert(target_doc, pdf_path) do
      result = generate_pdf_thumbnail(pdf_path)
      File.rm(pdf_path)
      result
    else
      error ->
        {:error, error}
    end
  end
end
