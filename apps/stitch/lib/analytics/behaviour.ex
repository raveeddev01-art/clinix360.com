defmodule Stitch.Analytics.Behaviour do
  @moduledoc """
  Defines an interface for expected interactions with the Analytics module.
  """

  alias Stitch.Accounts.User

  @callback identify(User.t) :: {:ok, term} | {:error, term}
  @callback identify_and_group(User.t) :: :ok | :error
  @callback track(user_id :: pos_integer, event :: String.t, properties :: map) :: {:ok, term} | {:error, term}
  @callback track(event :: String.t, properties :: map) :: {:ok, term} | {:error, term}

end
