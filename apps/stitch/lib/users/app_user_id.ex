defprotocol Stitch.AppUserId do
  @moduledoc """
  Allows provider and patient ids to be be used in the same namespace in an external storage;
  for example ElasticSearch or a Redis queue.
  """

  @doc """
      Stitch.AppUserId.get(provider)
      > "provider-1"

      Stitch.AppUserId.get(patient)
      > "patient-1"
  """
  def get(user)
end

defimpl Stitch.AppUserId, for: Stitch.Patient do
  def get(user), do: "patient-#{user.id}"
end

defimpl Stitch.AppUserId, for: Stitch.Accounts.User do
  def get(user), do: "provider-#{user.id}"
end
