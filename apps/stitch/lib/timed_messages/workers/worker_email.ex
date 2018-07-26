defmodule Stitch.TimedMessage.WorkerEmail do
  @type message_data :: map

  @callback subject(message_data) :: String.t()
  @callback load_data(message_data) :: {:ok, message_data}
  @callback send_if(message_data) :: :ok | :not_sendable
  @callback template_vars(Bamboo.Email.t(), message_data) :: Bamboo.Email.t()
end
