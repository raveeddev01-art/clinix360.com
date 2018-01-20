defmodule StitchConnect.Web.Api.FallbackController do
  @moduledoc """
  Controller fallback for handling common domain errors.
  """
  use Phoenix.Controller
  alias StitchConnect.Web.ControllerHelpers
  alias StitchConnect.Web.ErrorView

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    errors = ControllerHelpers.changeset_errors_to_map(changeset)
    conn
    |> put_status(:unprocessable_entity)
    |> render(ErrorView, :"422", errors: errors)
  end

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> render(ErrorView, :"404")
  end

  def call(conn, {:error, :not_authorized}) do
    conn
    |> put_status(:forbidden)
    |> render(ErrorView, :"403")
  end
end
