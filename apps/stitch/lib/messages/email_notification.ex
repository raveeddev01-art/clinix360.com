defmodule Stitch.EmailNotification do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{Repo, EmailNotification}

  schema "email_notifications" do
    belongs_to :user, Stitch.Accounts.User
    belongs_to :message, Stitch.Message
    field :delivered_at, :utc_datetime, default: nil
  end

  def changeset(%Stitch.EmailNotification{} = struct, params) do
    struct
    |> cast(params, [:user_id, :message_id, :delivered])
    |> validate_required([:user_id, :message_id])
  end

  def create(message_id, user_ids) do
    EmailNotification
    |> Repo.insert_all(Enum.map(user_ids, & [user_id: &1, message_id: message_id]))
  end

  def not_delivered(user_id) do
    EmailNotification
    |> where(user_id: ^user_id)
    |> where([en], not is_nil(en.delivered_at))
    |> select([en], en.message_id)
    |> Repo.all
  end

  def clean_delivered(before_datetime \\ week_ago) do
    EmailNotification
    |> where([en], en.delivered_at < ^before_datetime)
    |> where([en], not is_nil(en.delivered_at))
    |> Repo.delete_all([])
  end

  def mark_as_delivered(user_id, message_ids) do
    EmailNotification
    |> where([en], en.user_id == ^user_id)
    |> where([en], en.message_id in ^message_ids)
    |> update([m], set: [delivered: ^DateTime.utc_now])
    |> Repo.update_all([], returning: true)
  end

  defp week_ago do
    Timex.from_now(Timex.shift(DateTime.utc_now(), days: -7))
  end
end
