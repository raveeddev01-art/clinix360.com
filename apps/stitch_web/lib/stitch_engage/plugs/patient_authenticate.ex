defmodule Stitch.Web.Plug.PatientAuthenticate do
  @moduledoc """
  Plug for authenticating patient routes (logging in as patient, not
  a provider viewing patient info).

  Contains API, Browser (logged in), and Auth (for patient login) plugs.
  """

  import Plug.Conn

  alias Stitch.{
    Patient,
    PatientQueries,
    Web.ControllerHelpers,
    FeatureGateway
  }

  def init(default), do: default

  def call(conn, [:api]) do
    conn = fetch_query_params(conn)

    with token when is_binary(token) <- conn.params["authenticationToken"],
         %Patient{} = patient <- PatientQueries.get_by_token(token),
         {:feature_on, true} <- {:feature_on, FeatureGateway.enabled?(patient.team, "engage")} do
      conn
      |> assign(:team, patient.team)
      |> assign(:patient, patient)
    else
      _ ->
        conn
        |> put_status(:forbidden)
        |> Phoenix.Controller.json(%{message: "You are not authorized to access this resource."})
        |> halt
    end
  end

  def call(conn, [:browser]) do
    with {:token, token} when not is_nil(token) <-
           {:token, Stitch.Web.SessionService.get_patient_session_token(conn)},
         %Patient{} = patient <- PatientQueries.get_by_token(token),
         {:feature_on, true} <- {:feature_on, FeatureGateway.enabled?(patient.team, "engage")} do
      conn
      |> assign(:team, patient.team)
      |> assign(:patient, patient)
    else
      {:token, _token} ->
        conn
        |> Plug.Conn.put_session(:redirect_url, conn.request_path)
        |> Phoenix.Controller.redirect(to: "/patient/login")
        |> halt

      {:feature_on, _} ->
        conn
        |> Phoenix.Controller.redirect(to: "/")

      _ ->
        conn
        |> Plug.Conn.put_session(:redirect_url, conn.request_path)
        |> Phoenix.Controller.redirect(to: "/patient/login")
        |> halt
    end
  end

  def call(conn, [:auth]) do
    conn
  end
end
