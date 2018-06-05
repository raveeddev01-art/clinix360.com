defmodule StitchConnect.Web.ChannelsTestHelper do
  use Phoenix.ChannelTest
  alias StitchConnect.Web.UserSocket
  alias Stitch.{Repo, Group, GroupUser}
  import Stitch.Factory

  @endpoint Stitch.Web.Endpoint

  def create_users(_) do
    team = insert(:team)
    user1 = insert(:user, team: team, username: "u1")
    user2 = insert(:user, team: team, username: "u2")

    {:ok, team: team, user1: user1, user2: user2}
  end

  def connect_socket(%{user1: user1}) do
    {:ok, socket} = connect(UserSocket, %{"authenticationToken" => user1.token})
    {:ok, socket1: socket}
  end

  def create_private_group(%{user1: user1, team: team}) do
    attrs = %{team_id: team.id, name: "Private Room", slug: "private_room", public: false}

    group =
      %Group{}
      |> Group.changeset(attrs)
      |> Repo.insert!()

    %GroupUser{}
    |> GroupUser.changeset(%{group_id: group.id, user_id: user1.id})
    |> Repo.insert!()

    {:ok, private_group: group}
  end

  def create_group(%{team: team, user1: user1, user2: user2}) do
    attrs = %{team_id: team.id, name: "Group Room", slug: "group_main"}

    group = %Group{} |> Group.changeset(attrs) |> Repo.insert!()

    for id <- [user1.id, user2.id] do
      %GroupUser{}
      |> GroupUser.changeset(%{group_id: group.id, user_id: id})
      |> Repo.insert!()
    end

    {:ok, group: group}
  end

  def create_dm(%{team: team, user1: user1, user2: user2}) do
    sorted_ids = [user1.id, user2.id] |> Enum.sort() |> Enum.join(".")
    attrs = %{team_id: team.id, name: "__dm_group__", slug: "__dm:#{sorted_ids}", public: false}
    {:ok, group} = %Group{} |> Group.changeset(attrs) |> Repo.insert()

    for id <- Enum.uniq([user1.id, user2.id]) do
      %GroupUser{}
      |> GroupUser.changeset(%{group_id: group.id, user_id: id})
      |> Repo.insert!()
    end

    {:ok, dm_group: group}
  end
end
