defmodule Stitch.SystemMessages do
  @moduledoc """
  Central location for generating system messages.
  """
  alias Stitch.Repo
  alias Stitch.{Group, Message, Accounts.User}

  @doc """
  Generates a system message that a user joined a group.
  This should not be called for DMs.
  """
  def generate_user_joined_group(%Group{} = group, %User{} = user) do
    group
    |> Message.join_message_changeset(user)
    |> Repo.insert!()
    |> put_additional_info(group, user)
  end

  @doc """
  Generates a system message that a user left a group.
  This should not be called for DMs.
  """
  def generate_user_left_group(%Group{} = group, %User{} = user) do
    group
    |> Message.leave_message_changeset(user)
    |> Repo.insert!()
    |> put_additional_info(group, user)
  end

  defp put_additional_info(%Message{} = message, %Group{} = group, %User{} = user) do
    %Message{message | group: group, user: user}
  end
end