defmodule Stitch.Upload do
  alias Stitch.{Message, AWS.S3}

  def presign(%Message{type: "upload", fields: %{"url" => url}}) do
    S3.presign(url)
  end

  def presign(_message), do: :error
end
