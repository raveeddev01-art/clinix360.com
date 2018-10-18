defmodule Stitch.Files.ThumbGenerator do
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
end
