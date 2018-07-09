defmodule StitchEngage.Web.Api.V1.PatientAuthenticationController do
  import Plug.Conn
  use Stitch.Web, :controller
  alias Stitch.Patient
  alias Stitch.Web.Api.V1.PatientView

  action_fallback(Stitch.Web.Api.FallbackController)

  def login(conn, %{"email" => email, "password" => password}) do
    team = conn.assigns.team

    case Stitch.User.Authentication.validate_patient_email_and_password(team.id, email, password) do
      %Patient{} = patient ->
        case patient.disabled do
          false ->
            conn
            |> login_patient(patient)
            |> render(PatientView, "login.json", %{patient: patient})

          true ->
            {:error, :not_authorized, "This account is disabled."}
        end

      _ ->
        {:error, :not_authorized, "Email or password is incorrect."}
    end
  end
end
