defmodule Stitch.Web.Api.V1.ConversationControllerTest.Helper do
  use Stitch.Web.ConnCase, async: true
  alias Stitch.Web.SubdomainRouter.Helpers, as: Routes

  def setup(conn) do
    team = insert(:team)
    insert(:team_feature, team: team, name: "engage")
    user = insert(:user, team: team)
    patient = insert(:patient, team: team, onboarded: true)
    other_patient = insert(:patient, team: team, onboarded: true)
    insert(:patient_invitation, patient: patient)
    user_on_other_team = insert(:user, team: insert(:team))

    two_days_ago = Timex.shift(NaiveDateTime.utc_now(), days: -2)

    inbox = insert(:inbox, team: team)
    conversation = insert(:conversation, inbox: inbox, updated_at: two_days_ago)
    conversation_b = insert(:conversation, inbox: inbox)
    conversation_c = insert(:conversation, inbox: inbox)
    closed_conversation = insert(:conversation, inbox: inbox, open: false)

    insert(:conversation_message, conversation: conversation, provider: user)
    insert(:conversation_message, conversation: conversation_b, provider: user)
    insert(:conversation_message, conversation: conversation_c, provider: user)
    insert(:conversation_message, conversation: closed_conversation, provider: user)

    insert(:conversation_patient, conversation: conversation, patient: patient)
    insert(:conversation_patient, conversation: conversation_b, patient: patient)
    insert(:conversation_patient, conversation: conversation_c, patient: other_patient)
    insert(:conversation_patient, conversation: closed_conversation, patient: other_patient)

    conn = with_team_subdomain(conn, team)

    {:ok,
     conn: conn,
     conversation: conversation,
     conversation_b: conversation_b,
     conversation_c: conversation_c,
     open_conversation: conversation,
     closed_conversation: closed_conversation,
     inbox: inbox,
     user: user,
     user_on_other_team: user_on_other_team,
     patient: patient}
  end

  def call_index(setup_params, params \\ %{}) do
    setup_params.conn
    |> with_api_user(setup_params.user)
    |> get(
      Routes.api_v1_conversation_path(
        setup_params.conn,
        :index,
        setup_params.inbox.id
      ),
      params
    )
  end

  def call_patient_index(setup_params, params \\ %{}) do
    setup_params.conn
    |> with_api_user(setup_params.patient)
    |> get(
      Routes.api_v1_conversation_path(
        setup_params.conn,
        :patient_index,
        setup_params.inbox.id
      ),
      params
    )
  end

  def call_show(setup_params, overrides \\ %{}) do
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

  def call_patient_show(setup_params, overrides \\ %{}) do
    setup_params.conn
    |> with_api_user(setup_params.patient)
    |> get(
      Routes.api_v1_conversation_path(
        setup_params.conn,
        :patient_show,
        Map.get(overrides, :conversation_id, setup_params.conversation.id)
      )
    )
  end

  def call_post(setup_params, params, overrides \\ %{}) do
    setup_params.conn
    |> with_api_user(Map.get(overrides, :user, setup_params.user))
    |> post(
      Routes.api_v1_conversation_path(
        setup_params.conn,
        :create,
        setup_params.inbox.id
      ),
      params
    )
  end

  def call_put_open(setup_params, params, overrides \\ %{}) do
    setup_params.conn
    |> with_api_user(Map.get(overrides, :user, setup_params.user))
    |> put(
      Routes.api_v1_conversation_path(
        setup_params.conn,
        :open,
        Map.get(overrides, :conversation_id, setup_params.closed_conversation.id)
      ),
      params
    )
  end

  def call_put_close(setup_params, params, overrides \\ %{}) do
    setup_params.conn
    |> with_api_user(Map.get(overrides, :user, setup_params.user))
    |> put(
      Routes.api_v1_conversation_path(
        setup_params.conn,
        :close,
        Map.get(overrides, :conversation_id, setup_params.open_conversation.id)
      ),
      params
    )
  end
end

defmodule Stitch.Web.Api.V1.ConversationControllerTest do
  use Stitch.Web.ConnCase, async: true
  alias Stitch.Web.Api.V1.ConversationControllerTest.Helper

  describe "GET /api/v1/inbox/:inbox_id/conversations" do
    setup %{conn: conn} do
      Helper.setup(conn)
    end

    test "lists the conversations in an inbox", setup_params do
      conn = Helper.call_index(setup_params, %{})

      assert response = json_response(conn, 200)
      conversation_ids = response |> Enum.map(& &1["id"]) |> Enum.sort()

      ordered_ids = [
        setup_params.conversation.id,
        setup_params.conversation_b.id,
        setup_params.conversation_c.id,
        setup_params.closed_conversation.id
      ]

      assert conversation_ids == ordered_ids
    end

    test "lists only conversations before updated_before", setup_params do
      one_day_ago = Timex.shift(NaiveDateTime.utc_now(), days: -1)

      conn =
        Helper.call_index(setup_params, %{
          updated_before: one_day_ago
        })

      assert response = json_response(conn, 200)
      conversation_ids = response |> Enum.map(& &1["id"]) |> Enum.sort()

      early_update_ids = [setup_params.conversation.id]
      assert conversation_ids == early_update_ids
    end

    test "lists only only closed conversations if param given", setup_params do
      conn =
        Helper.call_index(setup_params, %{
          open: false
        })

      assert response = json_response(conn, 200)
      conversation_ids = response |> Enum.map(& &1["id"]) |> Enum.sort()

      closed_ids = [setup_params.closed_conversation.id]
      assert conversation_ids == closed_ids
    end
  end

  describe "GET /api/v1/patient/inbox/:inbox_id/conversations" do
    setup %{conn: conn} do
      Helper.setup(conn)
    end

    test "lists only the patient's conversations in an inbox", setup_params do
      conn = Helper.call_patient_index(setup_params, %{})

      assert response = json_response(conn, 200)
      conversation_ids = response |> Enum.map(& &1["id"]) |> Enum.sort()

      ordered_ids = [
        setup_params.conversation.id,
        setup_params.conversation_b.id
      ]

      assert conversation_ids == ordered_ids
    end
  end

  describe "GET /api/v1/conversations/:id" do
    setup %{conn: conn} do
      Helper.setup(conn)
    end

    test "shows the conversation properly", setup_params do
      conn = Helper.call_show(setup_params)
      assert response = json_response(conn, 200)
      assert response["id"] == setup_params.conversation.id
    end

    test "errors if not authorized", setup_params do
      conn = Helper.call_show(setup_params, %{user: setup_params.user_on_other_team})
      assert json_response(conn, 403)
    end

    test "errors if not found", setup_params do
      conn =
        Helper.call_show(setup_params, %{conversation_id: setup_params.conversation.id + 999})

      assert json_response(conn, 404)
    end
  end

  describe "GET /api/v1/patient/conversations/:id" do
    setup %{conn: conn} do
      Helper.setup(conn)
    end

    test "shows the conversation properly", setup_params do
      conn =
        Helper.call_patient_show(setup_params, %{conversation_id: setup_params.conversation.id})

      assert response = json_response(conn, 200)
      assert response["id"] == setup_params.conversation.id
    end

    test "returns not found if other patient's conversation", setup_params do
      conn =
        Helper.call_patient_show(setup_params, %{conversation_id: setup_params.conversation_c.id})

      assert json_response(conn, 404)
    end
  end

  describe "POST /api/v1/inbox/:inbox_id/conversations" do
    setup %{conn: conn} do
      Helper.setup(conn)
    end

    test "creates a conversation properly", setup_params do
      post_params = %{
        text_content: "This is some text",
        patient_id: setup_params.patient.id
      }

      conn = Helper.call_post(setup_params, post_params, %{})
      assert response = json_response(conn, 200)
      assert response["open"] == true
    end

    test "errors if not authorized", setup_params do
      post_params = %{
        text_content: "This is some text",
        patient_id: setup_params.patient.id
      }

      conn = Helper.call_post(setup_params, post_params, %{user: setup_params.user_on_other_team})
      assert json_response(conn, 403)
    end
  end

  describe "PUT /api/v1/conversations/:id/open" do
    setup %{conn: conn} do
      Helper.setup(conn)
    end

    test "opens a closed inbox", setup_params do
      conn = Helper.call_put_open(setup_params, %{})
      assert response = json_response(conn, 200)
      assert response["open"] == true
    end

    test "errors if already open", setup_params do
      conn =
        Helper.call_put_open(setup_params, %{}, %{
          conversation_id: setup_params.open_conversation.id
        })

      assert json_response(conn, 422)
    end

    test "errors if not authorized", setup_params do
      conn = Helper.call_put_open(setup_params, %{}, %{user: setup_params.user_on_other_team})

      assert json_response(conn, 403)
    end

    test "errors if not found", setup_params do
      conn =
        Helper.call_put_open(setup_params, %{}, %{
          conversation_id: setup_params.conversation.id + 1111
        })

      assert json_response(conn, 404)
    end
  end

  describe "PUT /api/v1/conversations/:id/close" do
    setup %{conn: conn} do
      Helper.setup(conn)
    end

    test "closes an open inbox", setup_params do
      conn = Helper.call_put_close(setup_params, %{})
      assert response = json_response(conn, 200)
      assert response["open"] == false
    end

    test "errors if already closed", setup_params do
      conn =
        Helper.call_put_close(setup_params, %{}, %{
          conversation_id: setup_params.closed_conversation.id
        })

      assert json_response(conn, 422)
    end

    test "errors if not authorized", setup_params do
      conn = Helper.call_put_close(setup_params, %{}, %{user: setup_params.user_on_other_team})
      assert json_response(conn, 403)
    end

    test "errors if not found", setup_params do
      conn =
        Helper.call_put_close(setup_params, %{}, %{
          conversation_id: setup_params.conversation.id + 1111
        })

      assert json_response(conn, 404)
    end
  end
end
