defmodule Stitch.Task do
  def start(fun) do
    if Application.get_env(:stitch, :async_tasks?, true) do
      Task.start(fun)
    else
      fun.()
    end
  end

  def async_stream(coll, fun, opts \\ []) do
    Task.async_stream(coll, fun, opts)
  end
end
