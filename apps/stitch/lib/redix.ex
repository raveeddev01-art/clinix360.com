defmodule Stitch.Redix do
  @redix_config Application.get_env(:stitch, :redix)

  def command(command) do
    Redix.command(:"redix_#{random_index()}", command)
  end

  def pipeline(commands) do
    Redix.pipeline(:"redix_#{random_index()}", commands)
  end

  defp random_index() do
    rem(System.unique_integer([:positive]), @redix_config.pool_size)
  end
end
