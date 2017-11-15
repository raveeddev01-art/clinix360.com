defmodule StitchConnect.Web.UserOnboardingTest do
  use StitchConnect.Web.ConnCase, async: true
  use Bamboo.Test
  import Ecto.Query
  alias StitchConnect.Web.Router.Helpers, as: Routes
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: SubdomainRoutes
  alias Stitch.{Accounts.User, Invitation, Repo}

  describe "PATCH /users/:id/complete-onboarding" do
    setup %{conn: conn} do
      team = insert(:team)
      _group = insert(:group, team: team, is_default: true)
      conn = %Plug.Conn{conn | host: "localhost"}

      {:ok, conn: conn, team: team}
    end

    test "successful onboarding", %{conn: conn, team: team} do
      user = insert(:user, %{email: "user@example.com", onboarded: false})

      invited_emails = ["foo@email.com", "bar@email.com"]
      conn =
        conn
        |> patch(Routes.api_v1_user_path(conn, :complete_onboarding, user.id), %{
          first_name: "User",
          last_name: "Name",
          username: "username",
          password: "Password1!",
          phone_number: "1231231234",
          pin: "0000",
          roles: ["admin"],
          team_id: team.id,
          invites: invited_emails
        })

      assert response = json_response(conn, 200)
      assert response["id"] == user.id
      assert response["onboarded"] == true

      invitee_ids = Repo.all from u in User,
        select: u.id,
        where: u.team_id == ^team.id,
        where: u.onboarded == false,
        where: u.email in ^invited_emails

      invites = Repo.all from i in Invitation,
        where: i.user_id in ^invitee_ids,
        preload: [:user, :team]

      assert length(invitee_ids) == 2
      assert length(invites) == 2

      inviter = Repo.get!(User, user.id)
      inviter_name = "#{inviter.first_name} #{inviter.last_name}"
      invites
      |> Enum.map(fn invite ->
        Invitation.Email.team_invitation(inviter_name, invite)
      end)
      |> Enum.each(fn email ->
        assert_delivered_email email
      end)
    end

    test "username format is invalid", %{conn: conn, team: team} do
      user = insert(:user, %{email: "user@example.com", onboarded: false})

      conn =
        conn
        |> patch(Routes.api_v1_user_path(conn, :complete_onboarding, user.id), %{
          first_name: "User",
          last_name: "Name",
          username: "Username",
          password: "Password1!",
          phone_number: "1231231234",
          pin: "0000",
          roles: ["admin"],
          team_id: team.id
        })

      assert response = json_response(conn, 422)
      assert response["message"] == "Username has invalid format"
    end
  end

  describe "POST /api/v1/invitations/accept/:token" do
    setup %{conn: conn} do
      team = insert(:team)
      _subscription = insert(:subscription, team: team)
      admin = insert(:user, team: team, username: "admin", roles: ["admin"])
      _group = insert(:group, team: team, is_default: true)

      conn =
        conn
        |> with_team_subdomain(team)

      Invitation.invite_to_team(admin.id, "user@example.com")
      assert [invite] = Repo.all(Invitation)

      {:ok, conn: conn, invite: invite}
    end

    test "accepts invitation", %{conn: conn, invite: invite} do
      conn = post(conn, SubdomainRoutes.api_v1_invitation_path(conn, :accept, invite.invite_token), %{
        username: "username",
        phone_number: "1231231234",
        pin: "0000",
      })
      assert response = json_response(conn, 200)
      assert response["email"] == "user@example.com"
      assert response["onboarded"] == true
    end

    test "username is already taken", %{conn: conn, invite: invite} do
      conn = post(conn, SubdomainRoutes.api_v1_invitation_path(conn, :accept, invite.invite_token), %{
        username: "admin",
        phone_number: "1231231234",
        pin: "0000",
      })
      assert response = json_response(conn, 422)
      assert response["message"] == "Username has already been taken"
    end
  end
end
