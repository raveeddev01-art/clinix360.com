defmodule StitchConnect.Web.ChannelAuthTest do
  use StitchConnect.Web.ChannelCase
  alias StitchConnect.Web.UserSocket

  describe "connecting to socket with token" do
    test "connection denied with incorrect token" do
      assert connect(UserSocket, %{"authenticationToken" => "abc"}) == :error
    end

    test "connection successful with correct token" do
      user = Stitch.Accounts.create_user_with_email_only("user@mail.com")

      assert {:ok, _} = connect(UserSocket, %{"authenticationToken" => user.token})
    end

    test "current user assigned in socket" do
      user = Stitch.Accounts.create_user_with_email_only("user@mail.com")

      {:ok, socket} = connect(UserSocket, %{"authenticationToken" => user.token})

      assert socket.assigns.current_user.id == user.id
    end
  end

  describe "joining group channels" do
    setup [:create_users, :connect_socket, :create_private_group]

    test "anyone can join public channels", %{socket1: socket1} do
      assert {:ok, _, _} = subscribe_and_join(socket1, "groups:general")
    end

    test "only existing groups can be joined", %{socket1: socket1} do
      {:error, error} = subscribe_and_join(socket1, "groups:blah")
      assert %{reason: "group not found"} = error
    end

    test "only members can join private groups", %{socket1: socket1, group1: group1, user2: user2} do
      {:ok, socket2} = connect(UserSocket, %{"authenticationToken" => user2.token})
      {:error, error2} = subscribe_and_join(socket2, "groups:#{group1.slug}")
      assert %{reason: "unauthorized"} = error2

      assert {:ok, _, _} = subscribe_and_join(socket1, "groups:#{group1.slug}")
    end
  end

  defp create_users(_) do
    team = Stitch.Team.Onboarding.create_team("Clinic", "clinic")

    user1 = Stitch.Accounts.create_user_with_email_only("user1@mail.com")
    user2 = Stitch.Accounts.create_user_with_email_only("user2@mail.com")

    attrs = %{
      fullname: "Sergio Tapia", username: "user1",
      password: "Password123!", pin: "0000",
      roles: ["admin"], team_id: team.id
    }

    user1 = Stitch.Accounts.update_and_complete_user_onboarding(user1.id, attrs)
    user2 = Stitch.Accounts.update_and_complete_user_onboarding(user2.id, %{attrs | username: "user2"})

    {:ok, team: team, user1: user1, user2: user2}
  end

  defp connect_socket(%{user1: user1}) do
    {:ok, socket} = connect(UserSocket, %{"authenticationToken" => user1.token})
    {:ok, socket1: socket}
  end

  def create_private_group(%{user1: user1, team: team}) do
    attrs = %{team_id: team.id, name: "Private Room", slug: "private_room", public: false}

    group = %Stitch.Group{}
    |> Stitch.Group.changeset(attrs)
    |> Repo.insert!

    %Stitch.GroupUser{}
    |> Stitch.GroupUser.changeset(%{group_id: group.id, user_id: user1.id})
    |> Repo.insert!

    {:ok, group1: group}
  end
end
