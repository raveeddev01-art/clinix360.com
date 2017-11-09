defmodule Stitch.Message.LinkPreview do
  def get_links(text) do
    ~r(https?://[^\s]+)
    |> Regex.scan(text)
    |> List.flatten
  end
end
