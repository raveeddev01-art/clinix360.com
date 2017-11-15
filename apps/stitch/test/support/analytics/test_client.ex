defmodule Stitch.Analytics.TestClient do
  @moduledoc """
  Mock Analytics client meant for testing purposes.
  """

  @behaviour Stitch.Analytics.Behaviour

  @impl Stitch.Analytics.Behaviour
  def identify(user), do: {:ok, user}

  @impl Stitch.Analytics.Behaviour
  def identify_and_group(_), do: :ok

  @impl Stitch.Analytics.Behaviour
  def track(_user_id, event, _properties), do: {:ok, event}

end
