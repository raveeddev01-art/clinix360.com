defmodule StitchConnect.Web.Api.V1.FallbackController do
  @moduledoc """
  Controller fallback for handling common domain errors.
  """
  use Phoenix.Controller
  alias StitchConnect.Web.{ErrorView}

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> render(StitchConnect.Web.Api.V1.ChangesetView, "error.json", changeset: changeset)
  end

  def call(conn, {:error, :unprocessable_entity, message}) do
    conn
    |> put_status(:unprocessable_entity)
    |> render(ErrorView, "422.json", errors: message)
  end

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> render(ErrorView, :"404")
  end

  def call(conn, {:error, :not_found, message}) do
    conn
    |> put_status(:not_found)
    |> render(ErrorView, "404.json", %{message: message})
  end

  def call(conn, {:error, :not_authorized}) do
    conn
    |> put_status(:forbidden)
    |> render(ErrorView, :"403")
  end

  def call(conn, {:error, :not_authorized, message}) do
    conn
    |> put_status(:forbidden)
    |> render(ErrorView, :"403", message: message)
  end

  def call(conn, {:error, :trial_expired}) do
    message = "Your trial has expired. Notify your team administrator to upgrade your subscription."
    conn
    |> put_status(:forbidden)
    |> render(ErrorView, :"403", message: message)
  end

  def call(conn, {:error, :subscription_expired}) do
    message = "Your subscription has expired. Notify your team administrator to renew your subscription."
    conn
    |> put_status(:forbidden)
    |> render(ErrorView, :"403", message: message)
  end

  def call(conn, {:error, {:insufficient_tier, valid_tiers}}) do
    tiers = Enum.join(valid_tiers, " or ")
    message = "This resource requires a higher subscription tier (#{tiers})."
    conn
    |> put_status(:forbidden)
    |> render(ErrorView, :"403", message: message)
  end
end
