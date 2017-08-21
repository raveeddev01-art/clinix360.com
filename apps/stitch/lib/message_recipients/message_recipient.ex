defmodule Stitch.MessageRecipient do
  use Ecto.Schema
  import Ecto.Query
  alias Stitch.{Repo, GroupUser, Message, MessageRecipient}

  schema "message_recipients" do
    belongs_to :group_user, GroupUser
    belongs_to :message, Message

    field :read_at, :utc_datetime
  end

  def create_entries(group, message) do
    group = Repo.preload group, :group_users
    entries = group.group_users
    |> Enum.reject(& &1.user_id == message.user_id ) # remove author
    |> Enum.map(& %{group_user_id: &1.id, message_id: message.id} )

    Repo.insert_all(MessageRecipient, entries, on_conflict: :nothing)
  end

  def mark_as_read(group_user, messages_ids) do
    MessageRecipient
    |> where(group_user_id: ^group_user.id)
    |> where([mr], is_nil(mr.read_at) and mr.message_id in ^messages_ids)
    |> Repo.update_all(set: [read_at: NaiveDateTime.utc_now])
    |> elem(0)
  end
end
