defmodule Stitch.Web.Api.V1.ConversationMessageControllerTest.SetupHelper do
  def setup(conn) do
    team = insert(:team)
    other_team = insert(:team)
    author = insert(:user, team: team)
    non_author_on_team = insert(:user, team: team)
    user_on_other_team = insert(:user, team: other_team)
    inbox = insert(:inbox, team: team)
    conversation = insert(:conversation, inbox: inbox)

    conversation_message =
      insert(:conversation_message, conversation: conversation, provider: author)
    conversation_message_2 =
      insert(:conversation_message, conversation: conversation, provider: author)

    {:ok,
     conversation_message: conversation_message,
     conversation: conversation,
     team: team,
     author: author}

    conn = with_team_subdomain(conn, team)

    {:ok,
       conn: conn
       conversation_message: conversation_message,
       conversation_message_2: conversation_message_2,
       conversation: conversation,
       team: team,
       author: author}
  end
end

defmodule Stitch.Web.Api.V1.ConversationMessageControllerTest do
  use Stitch.Web.ConnCase, async: true
  alias Stitch.Web.SubdomainRouter.Helpers, as: Routes
  alias Stitch.Web.Api.V1.ConversationMessageControllerTest.SetupHelper

  describe "GET /api/v1/conversations/:id/conversation_messages" do
    setup %{conn: conn} do
      SetupHelper.setup
    end

    test "lists messages with correct permissions", %{conversation: conversation, conn: conn, author: author} do
      conn =
        conn
        |> with_api_user(author)
        |> get(Routes.api_v1_conversaion_message_path(conn, :index, conversation.id))

      assert response = json_response(conn, 200
    end

    test "errors properly if not found" do
    end

    test "errors properly if not authorized" do
    end
  end

  describe "POST /api/v1/conversations/:id/conversation_messages" do
    setup %{conn: conn} do
      SetupHelper.setup
    end

    test "creates a conversation message properly" do
    end

    test "errors properly if not found" do
    end

    test "errors properly if not authorized" do
    end
  end

  describe "GET /api/v1/conversation_messages/:id" do
    setup %{conn: conn} do
      SetupHelper.setup
    end

    test "shows a conversation message properly" do
    end

    test "errors properly if not found" do
    end

    test "errors properly if not authorized" do
    end
  end

  describe "PUT /api/v1/conversation_messages/:id" do
    setup %{conn: conn} do
      SetupHelper.setup
    end

    test "updates a conversation message properly" do
    end

    test "errors properly if not found" do
    end

    test "errors properly if not authorized" do
    end
  end

  describe "DELETE /api/v1/conversation_messages/:id" do
    setup %{conn: conn} do
      SetupHelper.setup
    end

    test "deletes a conversation message properly" do
    end

    test "errors properly if not found" do
    end

    test "errors properly if not authorized" do
    end
  end
end
