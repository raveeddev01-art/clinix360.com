defmodule Stitch.Repo.Migrations.AddMetaToExistingMessages do
  use Ecto.Migration
  alias Stitch.Repo
  alias Stitch.Message

  @disable_ddl_transaction true

  def up do
    Repo.transaction(fn ->
      Message
      |> Repo.stream()
      |> Stream.each(fn
        %{text_content: text_content} = message when not is_nil(text_content) ->
          meta = Message.Parser.get_meta(text_content)

          result =
            message
            |> Ecto.Changeset.change(text_content_meta: meta)
            |> Repo.update

          case result do
            {:ok, _updated_message} ->
              nil
            {:error, changeset} ->
              IO.inspect(changeset)
          end
        _message -> nil
      end)
      |> Stream.run()
    end, timeout: :infinity)
  end

  def down do
  end
end
