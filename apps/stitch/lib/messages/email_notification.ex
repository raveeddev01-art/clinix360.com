defmodule Stitch.EmailNotification do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{Repo, EmailNotification}

  schema "email_notifications" do
    belongs_to :user, Stitch.Accounts.User
    belongs_to :message, Stitch.Message
    field :delivered, :boolean, default: false
    timestamps()
  end

  def changeset(%Stitch.EmailNotification{} = struct, params) do
    struct
    |> cast(params, [:user_id, :message_id, :delivered])
    |> validate_required([:user_id, :message_id])
  end

  def create_email_notification(user_id, message_id) do
    %EmailNotification{user_id: user_id, message_id: message_id}
    |> Repo.insert
  end

  def not_delivered(user_id) do
    EmailNotification
    |> where(user_id: ^user_id)
    |> where(delivered: ^false)
    |> select([en], en.message_id)
    |> Repo.all
  end

  def mark_as_delivered(user_id, message_ids) do
    EmailNotification
    |> where([en], en.user_id == ^user_id)
    |> where([en], en.message_id in ^message_ids)
    |> update([m], set: [delivered: true])
    |> Repo.update_all([], returning: true)
  end
end
