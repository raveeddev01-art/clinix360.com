defmodule StitchConnect.Web.ChannelsTestHelper do
  use Phoenix.ChannelTest
  alias StitchConnect.Web.UserSocket
  alias Stitch.{Repo, Group, GroupUser, Accounts}

  @endpoint StitchConnect.Web.Endpoint

  def create_users(_) do
    team = Stitch.Team.Onboarding.create_team("Clinic", "clinic")

    user1 = Accounts.create_user_with_email_only("user1@mail.com")
    user2 = Accounts.create_user_with_email_only("user2@mail.com")

    attrs = %{
      fullname: "Sergio Tapia", username: "user1",
      password: "Password123!", pin: "0000",
      roles: ["admin"], team_id: team.id
    }

    member_attrs = %{
      fullname: "Daniel Tapia", username: "user2",
      password: "Password123!", pin: "0000",
      roles: ["member"], team_id: team.id
    }

    user1 = Accounts.update_and_complete_user_onboarding(user1.id, attrs)
    user2 = Accounts.update_and_complete_user_onboarding(user2.id, member_attrs)

    {:ok, team: team, user1: user1, user2: user2}
  end

  def connect_socket(%{user1: user1}) do
    {:ok, socket} = connect(UserSocket, %{"authenticationToken" => user1.token})
    {:ok, socket1: socket}
  end

  def create_private_group(%{user1: user1, team: team}) do
    attrs = %{team_id: team.id, name: "Private Room", slug: "private_room", public: false}

    group = %Group{}
    |> Group.changeset(attrs)
    |> Repo.insert!

    %GroupUser{}
    |> GroupUser.changeset(%{group_id: group.id, user_id: user1.id})
    |> Repo.insert!

    {:ok, group1: group}
  end

  def create_group(%{team: team, user1: user1, user2: user2}) do
    attrs = %{team_id: team.id, name: "Group Room", slug: "group_main"}

    group = %Group{} |> Group.changeset(attrs) |> Repo.insert!

    for id <- [user1.id, user2.id] do
      %GroupUser{}
      |> GroupUser.changeset(%{group_id: group.id, user_id: id})
      |> Repo.insert!
    end

    {:ok, group: group}
  end

  def create_dm(%{team: team, user1: user1, user2: user2}) do
    sorted_ids = [user1.id, user2.id] |> Enum.sort |> Enum.join(".")
    attrs = %{team_id: team.id, name: "__dm_group__", slug: "__dm:#{sorted_ids}", public: false}
    {:ok, group} = %Group{} |> Group.changeset(attrs) |> Repo.insert

    for id <- Enum.uniq([user1.id, user2.id]) do
      %GroupUser{}
      |> GroupUser.changeset(%{group_id: group.id, user_id: id})
      |> Repo.insert!
    end

    {:ok, dm_group: group}
  end
end
