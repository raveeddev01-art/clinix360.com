defmodule StitchEngage.Web.PatientAuthenticationController do
  use Stitch.Web, :controller

  alias Stitch.{
    Patient,
    PatientQueries
  }

  def login(conn, _params) do
    with {:token, token} when not is_nil(token) <-
           {:token, Stitch.Web.SessionService.get_patient_session_token(conn)},
         %Patient{} <- PatientQueries.get_by_token(token) do
      # If the patient is already logged in, redirect to patient homepage.
      redirect(conn, to: "/patient")
    else
      _ ->
        login_params =
          Poison.encode!(%{
            "teamName" => conn.private[:team_name],
            "teamSlug" => conn.private[:team_slug],
            "invalidLogin" => get_flash(conn, :invalid_login)
          })

        conn
        |> assign(:title, "Patient Login")
        |> assign(:description, "Log in to InvoCom")
        |> render(Stitch.Web.AuthenticationView, "login.html", login_params: login_params)
    end
  end

  def logout(conn, _) do
    conn
    |> delete_patient_session(conn.assigns.team.id)
    |> delete_session(:redirect_url)
    |> redirect(to: "/patient/logged-out")
  end

  def logged_out(conn, _) do
    logged_out_params =
      Poison.encode!(%{
        "teamName" => conn.private[:team_name],
        "teamSlug" => conn.private[:team_slug]
      })

    conn
    |> delete_patient_session(conn.assigns.team.id)
    |> delete_session(:redirect_url)
    |> render(
      Stitch.Web.AuthenticationView,
      "logged_out.html",
      logged_out_params: logged_out_params
    )
  end

  def show(conn, _) do
    patient = conn.assigns.patient
    json(conn, %{name: patient.first_name <> " " <> patient.last_name})
  end
end
