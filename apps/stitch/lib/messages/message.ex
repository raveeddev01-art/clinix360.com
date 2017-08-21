defmodule Stitch.Message do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{Repo, Message}

  @valid_types ["chat", "system", "upload"]

  schema "messages" do
    belongs_to :user, Stitch.Accounts.User
    belongs_to :group, Stitch.Group
    belongs_to :pinned_by, Stitch.Accounts.User, foreign_key: :pinned_by_id
    field :deleted, :boolean, default: false
    field :edited_at, :utc_datetime
    field :text_content, :string
    field :type, :string
    field :fields, :map
    field :pinned, :boolean
    field :pinned_at, :utc_datetime

    timestamps()
  end

  def changeset(%Stitch.Message{} = struct, params) do
    struct
    |> cast(params, [:user_id, :group_id, :deleted, :text_content, :fields, :type, :pinned, :pinned_by_id, :pinned_at])
    |> validate_required([:user_id, :group_id, :deleted, :text_content])
    |> validate_inclusion(:type, @valid_types)
  end

  def user_edit_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [:text_content])
    |> validate_required([:text_content])
    |> put_change(:edited_at, DateTime.utc_now())
  end

  def upload_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [:fields, :type])
    |> validate_required([:fields, :type])
    |> validate_inclusion(:type, @valid_types)
  end

  def create(group_id, user_id, %{"type" => "chat", "text_content" => text_content}) do
    %Message{group_id: String.to_integer(group_id), user_id: user_id}
    |> changeset(%{text_content: text_content, type: "chat"})
    |> Repo.insert
  end

  def create(group_id, user_id, %{"type" => "upload", "fields" => fields}) do
    %Message{group_id: String.to_integer(group_id), user_id: user_id}
    |> upload_changeset(%{fields: fields, type: "upload"})
    |> Repo.insert
  end

  def create(group_id, user_id, %{"text_content" => text_content}) do
    create(group_id, user_id, %{"type" => "chat", "text_content" => text_content})
  end

  def create(group_id, user_id, attributes) do
    changeset = %Message{} |> change() |> add_error(:type, "is not supported")
    {:error, changeset}
  end

  def update(message, attributes) do
    message
    |> user_edit_changeset(%{text_content: attributes["text_content"]})
    |> Repo.update
  end

  def delete(message) do
    message
    |> Repo.delete
  end

  def pin(message, user) do
    message
    |> changeset(%{pinned: true, pinned_by_id: user.id, pinned_at: DateTime.utc_now})
    |> Repo.update
  end

  def unpin(message) do
    message
    |> changeset(%{pinned: false, pinned_by_id: nil, pinned_at: nil})
    |> Repo.update
  end
end
