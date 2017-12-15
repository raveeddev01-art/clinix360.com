defmodule Stitch.Intercom do
  @moduledoc """
  Intercom related functions.
  """

  @doc """
  Generates identity verification user hash required by Intercom.
  """
  @spec identity_verification_user_hash(pos_integer) :: binary
  def identity_verification_user_hash(user_id) do
    intercom_key = System.get_env("INTERCOM_IDENTITY_VERIFICATION_SECRET")
    :sha256
    |> :crypto.hmac(intercom_key, "#{user_id}")
    |> Base.encode16()
    |> String.downcase()
  end
end
