defmodule StitchEngage.Web.PatientAuthenticationController do
  use Stitch.Web, :controller

  alias Stitch.{
    Patient,
    PatientQueries
  }

  def login(conn, _params) do
    with {:token, token} when not is_nil(token) <-
           {:token, Stitch.Web.ControllerHelpers.get_patient_session_token(conn)},
         %Patient{} <- PatientQueries.get_by_token(token) do
      # If the patient is already logged in, redirect to patient homepage.
      redirect(conn, to: "/patient")
    else
      _ ->
        conn
        |> assign(:title, "Patient Login")
        |> assign(:description, "Log in to Stitch Health")
        |> render("patient_login.html")
    end
  end

  def logout(conn, _) do
    conn
    |> delete_patient_session(conn.assigns.team.id)
    |> redirect(to: "/patient/login")
  end

  def show(conn, _) do
    patient = conn.assigns.patient
    json(conn, %{name: patient.first_name <> " " <> patient.last_name})
  end

  def submit_login(conn, %{"patient" => %{"email" => email, "password" => password}}) do
    team = conn.assigns.team

    case Stitch.User.Authentication.validate_patient_email_and_password(team.id, email, password) do
      %Patient{} = patient ->
        case patient.disabled do
          false ->
            conn
            |> login_patient(patient)
            |> redirect(to: "/patient")

          true ->
            conn
            |> put_flash(
              :invalid_login,
              "This account is disabled.."
            )
            |> redirect(to: "/patient/login")
        end

      _ ->
        conn
        |> put_flash(:invalid_login, "Sorry, you entered an invalid email or password.")
        |> redirect(to: "/patient/login")
    end
  end
end
