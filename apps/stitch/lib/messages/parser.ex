defmodule Stitch.Message.Parser do
  alias Stitch.Message.Parser.Lexer
  use Appsignal.Instrumentation.Decorators
  require Logger

  @decorate transaction_event(:background_job)
  def get_meta(string) do
    try do
      Lexer.run(string).tokens
    rescue
      error ->
        Logger.error("[#{__MODULE__}] #{inspect(error)}")
        []
    end
  end
end
