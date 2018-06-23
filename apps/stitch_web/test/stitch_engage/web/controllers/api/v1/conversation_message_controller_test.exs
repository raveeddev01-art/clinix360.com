defmodule Stitch.Web.Api.V1.ConversationMessageControllerTest.SetupHelper do
  use Stitch.Web.ConnCase, async: true

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

    conn = with_team_subdomain(conn, team)

    {:ok,
     conn: conn,
     conversation_message: conversation_message,
     conversation_message_2: conversation_message_2,
     conversation: conversation,
     team: team,
     author: author,
     user_on_other_team: user_on_other_team,
     non_author_on_team: non_author_on_team}
  end
end

defmodule Stitch.Web.Api.V1.ConversationMessageControllerTest do
  use Stitch.Web.ConnCase, async: true
  alias Stitch.Web.SubdomainRouter.Helpers, as: Routes
  alias Stitch.Web.Api.V1.ConversationMessageControllerTest.SetupHelper

  describe "GET /api/v1/conversations/:id/conversation_messages" do
    setup %{conn: conn} do
      SetupHelper.setup(conn)
    end

    test "lists messages with correct permissions", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.author)
        |> get(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :index,
            setup_params.conversation.id
          )
        )

      assert response = json_response(conn, 200)
      response_ids = response |> Enum.map(& &1["id"]) |> Enum.sort()

      message_ids =
        [setup_params.conversation_message, setup_params.conversation_message_2]
        |> Enum.map(& &1.id)
        |> Enum.sort()

      assert response_ids == message_ids
    end

    test "errors properly if not found", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.author)
        |> get(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :index,
            setup_params.conversation.id + 11111
          )
        )

      assert json_response(conn, 404)
    end

    test "errors properly if not authorized", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.user_on_other_team)
        |> get(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :index,
            setup_params.conversation.id
          )
        )

      assert json_response(conn, 403)
    end
  end

  describe "POST /api/v1/conversations/:id/conversation_messages" do
    setup %{conn: conn} do
      SetupHelper.setup(conn)
    end

    test "creates a conversation message properly", setup_params do
      valid_attrs = %{
        message: %{
          text_content: "Hello."
        }
      }

      conn =
        setup_params.conn
        |> with_api_user(setup_params.author)
        |> post(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :create,
            setup_params.conversation.id
          ),
          valid_attrs
        )

      assert response = json_response(conn, 201)
      assert response["text_content"] == "Hello."
    end

    test "creates a file share conversation message properly", setup_params do
      valid_attrs = %{
        message: %{
          text_content: "Check out this file.",
          type: "upload",
          fields: %{
            filename: "config.json",
            mimetype: "application/json",
            size_in_bytes: 1523,
            url: "https://s3.amazonaws.com/stitch-content/foo-bar-baz.json"
          }
        }
      }

      conn =
        setup_params.conn
        |> with_api_user(setup_params.author)
        |> post(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :create,
            setup_params.conversation.id
          ),
          valid_attrs
        )

      assert response = json_response(conn, 201)
      assert response["text_content"] == "Check out this file."
    end

    test "errors properly if not found", setup_params do
      valid_attrs = %{
        message: %{
          text_content: "Hello."
        }
      }

      conn =
        setup_params.conn
        |> with_api_user(setup_params.author)
        |> post(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :create,
            setup_params.conversation.id + 11111
          ),
          valid_attrs
        )

      assert json_response(conn, 404)
    end

    test "errors properly if invalid attrs", setup_params do
      invalid_attrs = %{
        message: %{
          doesnt_have: "text_content"
        }
      }

      conn =
        setup_params.conn
        |> with_api_user(setup_params.author)
        |> post(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :create,
            setup_params.conversation.id
          ),
          invalid_attrs
        )

      assert json_response(conn, 422)
    end

    test "errors properly if not authorized", setup_params do
      invalid_attrs = %{
        message: %{
          doesnt_have: "text_content"
        }
      }

      conn =
        setup_params.conn
        |> with_api_user(setup_params.user_on_other_team)
        |> post(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :create,
            setup_params.conversation.id
          ),
          invalid_attrs
        )

      assert json_response(conn, 403)
    end
  end

  describe "GET /api/v1/conversation_messages/:id" do
    setup %{conn: conn} do
      SetupHelper.setup(conn)
    end

    test "shows a conversation message properly", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.author)
        |> get(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :show,
            setup_params.conversation_message.id
          )
        )

      assert response = json_response(conn, 200)
      assert response["text_content"] == setup_params.conversation_message.text_content
    end

    test "errors properly if not found", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.author)
        |> get(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :show,
            setup_params.conversation_message.id + 111
          )
        )

      assert json_response(conn, 404)
    end

    test "errors properly if not authorized", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.user_on_other_team)
        |> get(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :show,
            setup_params.conversation_message.id
          )
        )

      assert json_response(conn, 403)
    end
  end

  describe "PUT /api/v1/conversation_messages/:id" do
    setup %{conn: conn} do
      SetupHelper.setup(conn)
    end

    test "updates a conversation message properly", setup_params do
      valid_attrs = %{
        message: %{
          text_content: "Goodbye."
        }
      }

      conn =
        setup_params.conn
        |> with_api_user(setup_params.author)
        |> put(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :update,
            setup_params.conversation_message.id
          ),
          valid_attrs
        )

      assert response = json_response(conn, 200)
      assert response["text_content"] == "Goodbye."
    end

    test "errors properly if bad params given", setup_params do
      invalid_attrs = %{
        message: %{
          no_text_content: ""
        }
      }

      conn =
        setup_params.conn
        |> with_api_user(setup_params.author)
        |> put(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :update,
            setup_params.conversation_message.id
          ),
          invalid_attrs
        )

      assert json_response(conn, 422)
    end

    test "errors properly if not found", setup_params do
      valid_attrs = %{
        message: %{
          text_content: "Goodbye."
        }
      }

      conn =
        setup_params.conn
        |> with_api_user(setup_params.author)
        |> put(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :update,
            setup_params.conversation_message.id + 22233
          ),
          valid_attrs
        )

      assert json_response(conn, 404)
    end

    test "errors properly if not authorized", setup_params do
      valid_attrs = %{
        message: %{
          text_content: "Goodbye."
        }
      }

      conn =
        setup_params.conn
        |> with_api_user(setup_params.non_author_on_team)
        |> put(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :update,
            setup_params.conversation_message.id
          ),
          valid_attrs
        )

      assert json_response(conn, 403)
    end
  end

  describe "DELETE /api/v1/conversation_messages/:id" do
    setup %{conn: conn} do
      SetupHelper.setup(conn)
    end

    test "deletes a conversation message properly", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.author)
        |> delete(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :delete,
            setup_params.conversation_message.id
          )
        )

      assert conn.status == 204
    end

    test "errors properly if not found", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.author)
        |> delete(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :delete,
            setup_params.conversation_message.id + 1111
          )
        )

      assert json_response(conn, 404)
    end

    test "errors properly if not authorized", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.non_author_on_team)
        |> delete(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :delete,
            setup_params.conversation_message.id
          )
        )

      assert json_response(conn, 403)
    end
  end

  describe "PUT /api/v1/conversation_messages/:id/toggle_reaction" do
    setup %{conn: conn} do
      SetupHelper.setup(conn)
    end

    test "deletes a conversation message properly", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.author)
        |> put(
          Routes.api_v1_conversation_message_path(
            setup_params.conn,
            :toggle_reaction,
            setup_params.conversation_message.id
          ),
          %{emoji_name: "clown_face"}
        )

      assert conn.status == 200
    end
  end
end
