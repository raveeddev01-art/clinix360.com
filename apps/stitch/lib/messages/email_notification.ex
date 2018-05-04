defmodule Stitch.EmailNotification do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{Repo, EmailNotification, Message}

  schema "email_notifications" do
    belongs_to(:user, Stitch.Accounts.User)
    belongs_to(:message, Stitch.Message)
    timestamps(updated_at: false)
  end

  def changeset(%Stitch.EmailNotification{} = struct, params) do
    struct
    |> cast(params, [:user_id, :message_id])
    |> validate_required([:user_id, :message_id])
  end

  def create(message_id, user_ids) do
    EmailNotification
    |> Repo.insert_all(
      Enum.map(user_ids, &[user_id: &1, message_id: message_id, inserted_at: DateTime.utc_now()])
    )
  end

  def for_user(user_id) do
    Message
    |> join(
      :inner,
      [m],
      en in EmailNotification,
      m.id == en.message_id and en.user_id == ^user_id
    )
    |> join(:inner, [m, en], assoc(m, :user))
    |> join(:inner, [m, en], assoc(m, :group))
    |> preload([:group, :user])
    |> Repo.all()
  end

  def count(user_ids) do
    EmailNotification
    |> where([en], en.user_id in ^user_ids)
    |> group_by([en], en.user_id)
    |> select([en], %{
      user_id: en.user_id,
      message_count: count(en.message_id)
    })
    |> Repo.all()
  end

  def clean_delivered(user_ids) do
    EmailNotification
    |> where([en], en.user_id in ^user_ids)
    |> Repo.delete_all([])
  end
end
