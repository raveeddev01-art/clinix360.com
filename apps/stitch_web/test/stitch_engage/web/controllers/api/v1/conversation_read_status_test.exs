defmodule Stitch.Web.Api.V1.ConversationReadStatusTest.Helper do
  use Stitch.Web.ConnCase, async: true
  alias Stitch.Web.SubdomainRouter.Helpers, as: Routes

  def setup(conn) do
    three_days_ago = Timex.shift(NaiveDateTime.utc_now(), days: -3)
    two_days_ago = Timex.shift(NaiveDateTime.utc_now(), days: -2)
    now = NaiveDateTime.utc_now()

    team = insert(:team)
    user = insert(:user, team: team, inserted_at: three_days_ago)
    other_user = insert(:user, team: team, inserted_at: three_days_ago)
    user_with_explicit_unread = insert(:user, team: team)
    user_with_explicit_read = insert(:user, team: team)

    inbox = insert(:inbox, team: team)

    conversation =
      insert(:conversation, inbox: inbox, updated_at: two_days_ago, inserted_at: two_days_ago)

    first_message =
      insert(
        :conversation_message,
        conversation: conversation,
        provider: other_user,
        inserted_at: two_days_ago,
        provider_read_status: %{
          user_with_explicit_unread.id => nil,
          user_with_explicit_read.id => three_days_ago
        }
      )

    next_message =
      insert(
        :conversation_message,
        conversation: conversation,
        provider: other_user,
        provider_read_status: %{
          user_with_explicit_unread.id => nil,
          user_with_explicit_read.id => three_days_ago
        }
      )

    newly_joined_user = insert(:user, team: team)

    _with_unread_conversation_provider =
      insert(
        :conversation_provider,
        conversation: conversation,
        provider: user_with_explicit_unread,
        unread_messages_count: 2,
        inserted_at: three_days_ago,
        last_read_at: three_days_ago
      )

    _all_read_conversation_provider =
      insert(
        :conversation_provider,
        conversation: conversation,
        provider: user_with_explicit_read,
        unread_messages_count: 0,
        inserted_at: now,
        last_read_at: now
      )

    conn = with_team_subdomain(conn, team)

    {:ok,
     conn: conn,
     conversation: conversation,
     inbox: inbox,
     user: user,
     old_joined_user: other_user,
     newly_joined_user: newly_joined_user,
     user_with_explicit_unread: user_with_explicit_unread,
     user_with_explicit_read: user_with_explicit_read,
     first_message: first_message,
     next_message: next_message}
  end

  def call_conversation_show(setup_params, overrides \\ %{}) do
    setup_params.conn
    |> with_api_user(Map.get(overrides, :user, setup_params.user))
    |> get(
      Routes.api_v1_conversation_path(
        setup_params.conn,
        :show,
        Map.get(overrides, :conversation_id, setup_params.conversation.id)
      )
    )
  end

  def call_message_show(setup_params, overrides \\ %{}) do
    setup_params.conn
    |> with_api_user(Map.get(overrides, :user, setup_params.user))
    |> get(
      Routes.api_v1_conversation_message_path(
        setup_params.conn,
        :show,
        Map.get(
          overrides,
          :conversation_message_id,
          setup_params.first_message.id
        )
      )
    )
  end

  def call_mark_as_read(setup_params, params \\ %{}) do
    call_post(:mark_as_read, setup_params, params)
  end

  def call_mark_as_unread(setup_params, params \\ %{}) do
    call_post(:mark_as_unread, setup_params, params)
  end

  defp call_post(action, setup_params, params) do
    conv_message_id = Map.get(params, :conversation_message_id, setup_params.first_message.id)

    setup_params.conn
    |> with_api_user(Map.get(params, :user, setup_params.user))
    |> post(
      Routes.api_v1_conversation_message_path(
        setup_params.conn,
        action,
        Map.get(params, :conversation_id, setup_params.conversation.id)
      ),
      %{conversation_message_id: conv_message_id}
    )
  end
end

defmodule Stitch.Web.Api.V1.ConversationControllerTest do
  use Stitch.Web.ConnCase, async: true
  alias Stitch.Web.Api.V1.ConversationReadStatusTest.Helper

  describe "GET /api/v1/conversations/:conversation_id" do
    setup %{conn: conn} do
      Helper.setup(conn)
    end

    test "is_unread is true if conversation has unread message and no conversation_provider value",
         setup_params do
      conn = Helper.call_conversation_show(setup_params, %{user: setup_params.old_joined_user})

      assert response = json_response(conn, 200)
      assert response["is_unread"]
    end

    test "is_unread is false if conversation made before user joined", setup_params do
      conn = Helper.call_conversation_show(setup_params, %{user: setup_params.newly_joined_user})

      assert response = json_response(conn, 200)
      refute response["is_unread"]
    end

    test "is_unread is true if conversation_providers is explicitly marked before latest message",
         setup_params do
      conn =
        Helper.call_conversation_show(setup_params, %{
          user: setup_params.user_with_explicit_unread
        })

      assert response = json_response(conn, 200)
      assert response["is_unread"]
    end

    test "is_unread is false if conversation_providers is explicitly marked after latest message",
         setup_params do
      conn =
        Helper.call_conversation_show(setup_params, %{user: setup_params.user_with_explicit_read})

      assert response = json_response(conn, 200)
      refute response["is_unread"]
    end
  end

  describe "GET /api/v1/conversations/:conversation_id/mark_as_read" do
    setup %{conn: conn} do
      Helper.setup(conn)
    end

    test "marks a message as read when no conversation provider exists", setup_params do
      params = %{
        user: setup_params.user,
        conversation_message_id: setup_params.first_message.id
      }

      conn = Helper.call_conversation_show(setup_params, params)
      assert response = json_response(conn, 200)
      assert response["is_unread"]

      Helper.call_mark_as_read(setup_params, params)

      next_conn = Helper.call_conversation_show(setup_params, params)
      assert response = json_response(next_conn, 200)
      refute response["is_unread"]
    end

    test "marks a message as read when conversation provider exists", setup_params do
      params = %{
        user: setup_params.user_with_explicit_unread,
        conversation_message_id: setup_params.next_message.id
      }

      conn = Helper.call_conversation_show(setup_params, params)
      assert response = json_response(conn, 200)
      assert response["is_unread"]

      Helper.call_mark_as_read(setup_params, params)

      next_conn = Helper.call_conversation_show(setup_params, params)
      assert response = json_response(next_conn, 200)
      refute response["is_unread"]
    end

    test "marking a later message read marks all previous as read", setup_params do
      first_message_params = %{
        user: setup_params.user_with_explicit_unread,
        conversation_message_id: setup_params.first_message.id
      }

      later_message_params = %{
        user: setup_params.user_with_explicit_unread,
        conversation_message_id: setup_params.next_message.id
      }

      read_status = & &1["provider_read_status"]["#{setup_params.user_with_explicit_unread.id}"]

      conn = Helper.call_message_show(setup_params, first_message_params)
      assert response = json_response(conn, 200)
      assert read_status.(response) == nil

      Helper.call_mark_as_read(setup_params, later_message_params)

      next_conn = Helper.call_message_show(setup_params, first_message_params)
      assert response = json_response(next_conn, 200)
      assert read_status.(response) != nil
    end
  end

  describe "GET /api/v1/conversations/:conversation_id/mark_as_unread" do
    setup %{conn: conn} do
      Helper.setup(conn)
    end

    test "marks a message as unread with no conversation_patient", setup_params do
      params = %{
        user: setup_params.newly_joined_user,
        conversation_message_id: setup_params.next_message.id
      }

      conn = Helper.call_conversation_show(setup_params, params)
      assert response = json_response(conn, 200)
      refute response["is_unread"]

      Helper.call_mark_as_unread(setup_params, params)

      next_conn = Helper.call_conversation_show(setup_params, params)
      assert response = json_response(next_conn, 200)
      assert response["is_unread"]
    end

    test "marking an earlier message as unread changes later read_status (with conversation_provider)",
         setup_params do
      first_message_params = %{
        user: setup_params.user_with_explicit_read,
        conversation_message_id: setup_params.first_message.id
      }

      later_message_params = %{
        user: setup_params.user_with_explicit_read,
        conversation_message_id: setup_params.next_message.id
      }

      read_status = & &1["provider_read_status"]["#{setup_params.user_with_explicit_read.id}"]

      conn = Helper.call_message_show(setup_params, later_message_params)
      assert response = json_response(conn, 200)
      assert read_status.(response) != nil

      Helper.call_mark_as_unread(setup_params, first_message_params)

      next_conn = Helper.call_message_show(setup_params, later_message_params)
      assert response = json_response(next_conn, 200)
      assert read_status.(response) == nil
    end

    test "changes is_unread of conversation properly (with conversation_provider)",
         setup_params do
      params = %{
        user: setup_params.user_with_explicit_read,
        conversation_message_id: setup_params.next_message.id
      }

      conn = Helper.call_conversation_show(setup_params, params)
      assert response = json_response(conn, 200)
      refute response["is_unread"]

      Helper.call_mark_as_unread(setup_params, params)

      next_conn = Helper.call_conversation_show(setup_params, params)
      assert response = json_response(next_conn, 200)
      assert response["is_unread"]
    end
  end
end
