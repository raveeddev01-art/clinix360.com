defmodule StitchConnect.Web.InvitationController do
  use Stitch.Web, :controller

  alias Stitch.{
    Invitation,
    PatientQueries,
    Web.TeamChannel
  }

  def accept(conn, %{"token" => invite_token}) do
    with {:ok, invitation} <- Invitation.get_by_invite_token(invite_token) do
      case invitation.team_id == conn.private[:team_id] do
        true ->
          case invitation.user.onboarded do
            false ->
              app_params =
                Poison.encode!(%{
                  "teamName" => conn.private[:team_name],
                  "teamId" => conn.private[:team_id],
                  "subdomain" => conn.private[:subdomain],
                  "inviteToken" => invitation.invite_token
                })

              render(conn, "accept.html", app_params: app_params)

            true ->
              app_params =
                Poison.encode!(%{
                  "inviteToken" => "",
                  "error" => "Already onboarded"
                })

              render(conn, "accept.html", app_params: app_params)
          end

        false ->
          app_params =
            Poison.encode!(%{
              "inviteToken" => ""
            })

          render(conn, "accept.html", app_params: app_params)
      end
    else
      {:error, _message} ->
        app_params =
          Poison.encode!(%{
            "inviteToken" => ""
          })

        render(conn, "accept.html", app_params: app_params)
    end
  end

  def error(conn, _params) do
    app_params =
      Poison.encode!(%{
        "inviteToken" => ""
      })

    render(conn, "accept.html", app_params: app_params)
  end

  def patient_accept(conn, %{"token" => invite_token}) do
    case PatientQueries.get_by_invite_token(invite_token) do
      nil ->
        conn
        |> put_flash(
          :invalid_login,
          "Invalid Token."
        )
        |> redirect(to: "/")

      patient ->
        case patient.onboarded do
          true ->
            conn
            |> login_patient(patient)
            |> redirect(to: "/patient")

          false ->
            conn
            |> login_patient(patient)
            |> render(
              "patient_accept.html",
              email: patient.email,
              last_name: patient.last_name,
              first_name: patient.first_name,
              phone_number: patient.phone_number,
              token: invite_token
            )
        end
    end
  end

  def patient_onboard(conn, %{"token" => invite_token, "patient" => patient_params}) do
    case Invitation.accept_and_complete_patient_onboarding(invite_token, patient_params) do
      {:ok, %{patient: patient}} ->
        TeamChannel.broadcast_patient_updated(patient.team_id, patient)

        conn
        |> login_patient(patient)
        |> redirect(to: "/patient")

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})

      {:error, message} when is_binary(message) ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})

      {:error, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Could not finish onboarding patient."})
    end
  end
end
