# defmodule Stitch.Web.Api.V1.ConversationMessageControllerTest.Helper do
#   use Stitch.Web.ConnCase, async: true
#   alias Stitch.Web.SubdomainRouter.Helpers, as: Routes

#   def setup(conn) do
#     team = insert(:team)
#     insert(:team_feature, name: "engage", team: team)
#     other_team = insert(:team)
#     author = insert(:user, team: team)
#     non_author_on_team = insert(:user, team: team)
#     user_on_other_team = insert(:user, team: other_team)
#     inbox = insert(:inbox, team: team)
#     conversation = insert(:conversation, inbox: inbox)
#     patient = insert(:patient, team: team)
#     insert(:conversation_patient, patient: patient, conversation: conversation)

#     conversation_message =
#       insert(:conversation_message, conversation: conversation, provider: author)

#     conversation_message_2 =
#       insert(:conversation_message, conversation: conversation, provider: author)

#     conn = with_team_subdomain(conn, team)

#     {:ok,
#      conn: conn,
#      conversation_message: conversation_message,
#      conversation_message_2: conversation_message_2,
#      conversation: conversation,
#      team: team,
#      author: author,
#      patient: patient,
#      user_on_other_team: user_on_other_team,
#      non_author_on_team: non_author_on_team}
#   end

#   def call_index(setup_params, overrides \\ %{}) do
#     setup_params.conn
#     |> with_api_user(Map.get(overrides, :user, setup_params.author))
#     |> get(
#       Routes.api_v1_conversation_message_path(
#         setup_params.conn,
#         :index,
#         Map.get(overrides, :conversation_id, setup_params.conversation.id)
#       )
#     )
#   end

#   def call_patient_index(setup_params, overrides \\ %{}) do
#     setup_params.conn
#     |> with_api_user(Map.get(overrides, :user, setup_params.patient))
#     |> get(
#       Routes.api_v1_conversation_message_path(
#         setup_params.conn,
#         :patient_index,
#         Map.get(overrides, :conversation_id, setup_params.conversation.id)
#       )
#     )
#   end

#   def call_post_message(setup_params, params, overrides \\ %{}) do
#     setup_params.conn
#     |> with_api_user(Map.get(overrides, :user, setup_params.author))
#     |> post(
#       Routes.api_v1_conversation_message_path(
#         setup_params.conn,
#         :create,
#         Map.get(overrides, :conversation_id, setup_params.conversation.id)
#       ),
#       params
#     )
#   end

#   def call_patient_post_message(setup_params, params, overrides \\ %{}) do
#     setup_params.conn
#     |> with_api_user(Map.get(overrides, :user, setup_params.patient))
#     |> post(
#       Routes.api_v1_conversation_message_path(
#         setup_params.conn,
#         :patient_create,
#         Map.get(overrides, :conversation_id, setup_params.conversation.id)
#       ),
#       params
#     )
#   end

#   def call_show(setup_params, overrides \\ %{}) do
#     setup_params.conn
#     |> with_api_user(Map.get(overrides, :user, setup_params.author))
#     |> get(
#       Routes.api_v1_conversation_message_path(
#         setup_params.conn,
#         :show,
#         Map.get(overrides, :conversation_message_id, setup_params.conversation_message.id)
#       )
#     )
#   end

#   def call_patient_show(setup_params, overrides \\ %{}) do
#     setup_params.conn
#     |> with_api_user(Map.get(overrides, :user, setup_params.patient))
#     |> get(
#       Routes.api_v1_conversation_message_path(
#         setup_params.conn,
#         :patient_show,
#         Map.get(overrides, :conversation_message_id, setup_params.conversation_message.id)
#       )
#     )
#   end

#   def call_update(setup_params, params, overrides \\ %{}) do
#     setup_params.conn
#     |> with_api_user(Map.get(overrides, :user, setup_params.author))
#     |> put(
#       Routes.api_v1_conversation_message_path(
#         setup_params.conn,
#         :update,
#         Map.get(overrides, :conversation_message_id, setup_params.conversation_message.id)
#       ),
#       params
#     )
#   end

#   def call_delete(setup_params, overrides \\ %{}) do
#     setup_params.conn
#     |> with_api_user(Map.get(overrides, :user, setup_params.author))
#     |> delete(
#       Routes.api_v1_conversation_message_path(
#         setup_params.conn,
#         :delete,
#         Map.get(overrides, :conversation_message_id, setup_params.conversation_message.id)
#       )
#     )
#   end

#   def call_reaction(setup_params) do
#     setup_params.conn
#     |> with_api_user(setup_params.author)
#     |> put(
#       Routes.api_v1_conversation_message_path(
#         setup_params.conn,
#         :toggle_reaction,
#         setup_params.conversation_message.id
#       ),
#       %{emoji_name: "clown_face"}
#     )
#   end

#   def call_patient_reaction(setup_params) do
#     setup_params.conn
#     |> with_api_user(setup_params.patient)
#     |> put(
#       Routes.api_v1_conversation_message_path(
#         setup_params.conn,
#         :patient_toggle_reaction,
#         setup_params.conversation_message.id
#       ),
#       %{emoji_name: "clown_face"}
#     )
#   end

#   def valid_post_attrs() do
#     %{
#       message: %{
#         text_content: "Hello."
#       }
#     }
#   end

#   def valid_put_attrs() do
#     %{
#       message: %{
#         text_content: "Goodbye."
#       }
#     }
#   end
# end

# defmodule Stitch.Web.Api.V1.ConversationMessageControllerTest do
#   use Stitch.Web.ConnCase, async: true
#   alias Stitch.Web.SubdomainRouter.Helpers, as: Routes
#   alias Stitch.Web.Api.V1.ConversationMessageControllerTest.Helper

#   describe "GET /api/v1/conversations/:id/conversation_messages" do
#     setup %{conn: conn}, do: Helper.setup(conn)

#     test "lists messages with correct permissions", setup_params do
#       conn = Helper.call_index(setup_params)
#       assert response = json_response(conn, 200)

#       response_ids = response |> Enum.map(& &1["id"]) |> Enum.sort()

#       message_ids =
#         [setup_params.conversation_message, setup_params.conversation_message_2]
#         |> Enum.map(& &1.id)
#         |> Enum.sort()

#       assert response_ids == message_ids
#     end

#     test "errors properly if not found", setup_params do
#       conn =
#         Helper.call_index(setup_params, %{conversation_id: setup_params.conversation.id + 11111})

#       assert json_response(conn, 404)
#     end

#     test "errors properly if not authorized", setup_params do
#       conn = Helper.call_index(setup_params, %{user: setup_params.user_on_other_team})
#       assert json_response(conn, 403)
#     end
#   end

#   describe "GET /api/v1/patient/conversations/:id/conversation_messages" do
#     setup %{conn: conn}, do: Helper.setup(conn)

#     test "lists messages with correct permissions", setup_params do
#       conn = Helper.call_patient_index(setup_params)

#       assert response = json_response(conn, 200)
#       response_ids = response |> Enum.map(& &1["id"]) |> Enum.sort()

#       message_ids =
#         [setup_params.conversation_message, setup_params.conversation_message_2]
#         |> Enum.map(& &1.id)
#         |> Enum.sort()

#       assert response_ids == message_ids
#     end

#     test "errors properly if not in conversation", setup_params do
#       patient_in_team_but_not_convo = insert(:patient, team: setup_params.team)
#       conn = Helper.call_patient_index(setup_params, %{user: patient_in_team_but_not_convo})
#       assert json_response(conn, 403)
#     end
#   end

#   describe "POST /api/v1/conversations/:id/conversation_messages" do
#     setup %{conn: conn}, do: Helper.setup(conn)

#     test "creates a conversation message properly", setup_params do
#       conn = Helper.call_post_message(setup_params, Helper.valid_post_attrs())

#       assert response = json_response(conn, 201)
#       assert response["text_content"] == "Hello."
#     end

#     test "creates a file share conversation message properly", setup_params do
#       valid_file_post_attrs = %{
#         message: %{
#           text_content: "Check out this file.",
#           type: "upload",
#           fields: %{
#             filename: "config.json",
#             mimetype: "application/json",
#             size_in_bytes: 1523,
#             url: "https://s3.amazonaws.com/stitch-content/foo-bar-baz.json"
#           }
#         }
#       }

#       conn = Helper.call_post_message(setup_params, valid_file_post_attrs)

#       assert response = json_response(conn, 201)
#       assert response["text_content"] == "Check out this file."
#     end

#     test "errors properly if not found", setup_params do
#       conn =
#         Helper.call_post_message(setup_params, Helper.valid_post_attrs(), %{
#           conversation_id: setup_params.conversation.id + 11111
#         })

#       assert json_response(conn, 404)
#     end

#     test "errors properly if invalid attrs", setup_params do
#       invalid_attrs = %{
#         message: %{
#           doesnt_have: "text_content"
#         }
#       }

#       conn = Helper.call_post_message(setup_params, invalid_attrs)

#       assert json_response(conn, 422)
#     end

#     test "errors properly if not authorized", setup_params do
#       conn =
#         Helper.call_post_message(setup_params, Helper.valid_post_attrs(), %{
#           user: setup_params.user_on_other_team
#         })

#       assert json_response(conn, 403)
#     end
#   end

#   describe "POST /api/v1/patient/conversations/:id/conversation_messages" do
#     setup %{conn: conn}, do: Helper.setup(conn)

#     test "creates a conversation message properly", setup_params do
#       conn = Helper.call_patient_post_message(setup_params, Helper.valid_post_attrs())

#       assert response = json_response(conn, 201)
#       assert response["text_content"] == "Hello."
#     end

#     test "errors properly if not authorized", setup_params do
#       patient_on_team_but_not_in_convo = insert(:patient, team: setup_params.team)

#       conn =
#         Helper.call_patient_post_message(setup_params, Helper.valid_post_attrs(), %{
#           user: patient_on_team_but_not_in_convo
#         })

#       assert json_response(conn, 403)
#     end
#   end

#   describe "GET /api/v1/conversation_messages/:id" do
#     setup %{conn: conn}, do: Helper.setup(conn)

#     test "shows a conversation message properly", setup_params do
#       conn = Helper.call_show(setup_params)

#       assert response = json_response(conn, 200)
#       assert response["text_content"] == setup_params.conversation_message.text_content
#     end

#     test "errors properly if not found", setup_params do
#       conn =
#         Helper.call_show(setup_params, %{
#           conversation_message_id: setup_params.conversation_message.id + 111
#         })

#       assert json_response(conn, 404)
#     end

#     test "errors properly if not authorized", setup_params do
#       conn =
#         Helper.call_show(setup_params, %{
#           user: setup_params.user_on_other_team
#         })

#       assert json_response(conn, 403)
#     end
#   end

#   describe "GET /api/v1/patient/conversation_messages/:id" do
#     setup %{conn: conn}, do: Helper.setup(conn)

#     test "shows a conversation message properly", setup_params do
#       conn = Helper.call_patient_show(setup_params)

#       assert response = json_response(conn, 200)
#       assert response["text_content"] == setup_params.conversation_message.text_content
#     end

#     test "errors properly if not in conversation", setup_params do
#       patient_in_team_but_not_convo = insert(:patient, team: setup_params.team)

#       conn =
#         Helper.call_patient_show(setup_params, %{
#           user: patient_in_team_but_not_convo
#         })

#       assert json_response(conn, 403)
#     end
#   end

#   describe "PUT /api/v1/conversation_messages/:id" do
#     setup %{conn: conn}, do: Helper.setup(conn)

#     test "updates a conversation message properly", setup_params do
#       conn = Helper.call_update(setup_params, Helper.valid_put_attrs())

#       assert response = json_response(conn, 200)
#       assert response["text_content"] == "Goodbye."
#     end

#     test "errors properly if bad params given", setup_params do
#       invalid_attrs = %{
#         message: %{
#           no_text_content: ""
#         }
#       }

#       conn = Helper.call_update(setup_params, invalid_attrs)
#       assert json_response(conn, 422)
#     end

#     test "errors properly if not found", setup_params do
#       conn =
#         Helper.call_update(setup_params, Helper.valid_put_attrs(), %{
#           conversation_message_id: setup_params.conversation_message.id + 22233
#         })

#       assert json_response(conn, 404)
#     end

#     test "errors properly if not authorized", setup_params do
#       conn =
#         Helper.call_update(setup_params, Helper.valid_put_attrs(), %{
#           user: setup_params.non_author_on_team
#         })

#       assert json_response(conn, 403)
#     end
#   end

#   describe "DELETE /api/v1/conversation_messages/:id" do
#     setup %{conn: conn}, do: Helper.setup(conn)

#     test "deletes a conversation message properly", setup_params do
#       conn = Helper.call_delete(setup_params)
#       assert conn.status == 204
#     end

#     test "errors properly if not found", setup_params do
#       conn =
#         Helper.call_delete(setup_params, %{
#           conversation_message_id: setup_params.conversation_message.id + 1111
#         })

#       assert json_response(conn, 404)
#     end

#     test "errors properly if not authorized", setup_params do
#       conn =
#         Helper.call_delete(setup_params, %{
#           user: setup_params.non_author_on_team
#         })

#       assert json_response(conn, 403)
#     end
#   end

#   describe "PUT /api/v1/conversation_messages/:id/toggle_reaction" do
#     setup %{conn: conn}, do: Helper.setup(conn)

#     test "updates a reaction properly", setup_params do
#       conn = Helper.call_reaction(setup_params)
#       assert conn.status == 200
#     end
#   end

#   describe "PUT /api/v1/patient/conversation_messages/:id/toggle_reaction" do
#     setup %{conn: conn}, do: Helper.setup(conn)

#     test "updates a reaction properly", setup_params do
#       conn = Helper.call_patient_reaction(setup_params)
#       assert conn.status == 200
#     end
#   end
# end
