defmodule Stitch.Exports.TeamHistory do
  @moduledoc """
  This module is responsible for generating team history zip archives for exports.
  """
  alias Stitch.Team
  alias Stitch.Exports.TeamHistory.Reader

  @doc """
  Generates zip archive export for a given team.

  ## Example:

      iex> generate_zip(%Stitch.Team{id: 1, ...})
      {:ok, "/path/to/the/generated.zip"}

  """
  @spec generate_zip(Team.t, timeout) :: {:ok, String.t} | {:error, [term, ...]}
  def generate_zip(team, timeout \\ 5_000) do
    with_zippable_directory(team, fn parent_path, name ->
      with {:ok, subpaths} <- write_to_zippable_directory(parent_path, name, team, timeout) do
        filepaths = prepare_filepaths(parent_path, subpaths)

        System.tmp_dir!()
        |> Path.join("#{Ecto.UUID.generate()}.zip")
        |> String.to_charlist()
        |> :zip.create(filepaths, cwd: String.to_charlist(parent_path))
      end
    end)
  end

  defp with_zippable_directory(%Team{} = team, fun) when is_function(fun, 2) do
    parent_path = Path.join(System.tmp_dir!(), Ecto.UUID.generate())
    name = generate_filename(team)
    path = Path.join(parent_path, name)
    File.mkdir_p!(path)

    try do
      fun.(parent_path, name)
    after
      File.rm_rf!(parent_path)
    end
  end

  @doc """
  Generates a filename for a given team.
  """
  @spec generate_filename(Team.t) :: String.t
  def generate_filename(%Team{name: name}) do
    timestamp = DateTime.utc_now() |> DateTime.to_iso8601()
    "#{name} Stitch Export #{timestamp}"
  end

  @spec write_to_zippable_directory(String.t, String.t, Team.t, timeout) :: {:ok, [String.t, ...]} | {:error, [term, ...]}
  defp write_to_zippable_directory(parent_path, zippable_directory, team, timeout) do
    directory = Path.join(parent_path, zippable_directory)
    write_rooms_task    = Task.async(fn -> write_rooms(directory, team) end)
    write_users_task    = Task.async(fn -> write_users(directory, team) end)
    write_messages_task = Task.async(fn -> write_messages(directory, team) end)

    [write_rooms_task, write_users_task, write_messages_task]
    |> Task.yield_many(timeout)
    |> process_task_results()
    |> prepare_final_result()
  end

  defp prepare_filepaths(parent_path, subpaths) do
    Enum.map(subpaths, fn subpath ->
      subpath
      |> Path.relative_to(parent_path)
      |> String.to_charlist()
    end)
  end

  defp process_task_results(task_results) do
    initial_acc = %{status: :ok, reasons: [], paths: []}
    Enum.reduce(task_results, initial_acc, &process_task_result/2)
  end

  defp process_task_result({task, result}, %{status: status, reasons: acc_reasons, paths: acc_paths}) do
    case result do
      {:ok, value} ->
        process_ok_task_result_value(value, status, acc_reasons, acc_paths)
      {:exit, reason} ->
        %{status: :error, reasons: [reason | acc_reasons], paths: acc_paths}
      nil ->
        shutdown_task(task, status, acc_reasons, acc_paths)
    end
  end

  defp process_ok_task_result_value({:ok, value_paths}, status, acc_reasons, acc_paths) do
    %{status: status, reasons: acc_reasons, paths: value_paths ++ acc_paths}
  end
  defp process_ok_task_result_value({:error, value_reasons}, _status, acc_reasons, acc_paths) do
    %{status: :error, reasons: value_reasons ++ acc_reasons, paths: acc_paths}
  end

  defp shutdown_task(task, status, acc_reasons, acc_paths) do
    case Task.shutdown(task, :brutal_kill) do
      nil -> %{status: :error, reasons: [:timeout | acc_reasons], paths: acc_paths}
      result -> process_task_result({task, result}, %{status: status, reasons: acc_reasons, paths: acc_paths})
    end
  end

  defp prepare_final_result(%{status: :ok, paths: paths}), do: {:ok, paths}
  defp prepare_final_result(%{status: :error, reasons: reasons}), do: {:error, reasons}

  defp write_rooms(directory, team) do
    path = Path.join(directory, "rooms.json")
    with :ok <- write_rooms_to_path(path, team) do
      {:ok, [path]}
    end
  end

  defp write_rooms_to_path(path, team) do
    json = team |> Reader.get_group_data() |> Poison.encode_to_iodata!(pretty: true)
    File.write(path, json)
  end

  defp write_users(directory, team) do
    path = Path.join(directory, "users.json")
    with :ok <- write_users_to_path(path, team) do
      {:ok, [path]}
    end
  end

  defp write_users_to_path(path, team) do
    json = team |> Reader.get_user_data() |> Poison.encode_to_iodata!(pretty: true)
    File.write(path, json)
  end

  defp write_messages(directory, team) do
    team.inserted_at
    |> list_target_months(NaiveDateTime.utc_now())
    |> Task.async_stream(&(write_messages_for_month(directory, team, &1)))
    |> Enum.reduce([], fn {:ok, paths}, acc_paths -> paths ++ acc_paths end)
    |> (fn paths -> {:ok, Enum.flat_map(paths, &(&1))} end).()
  end

  defp write_messages_for_month(directory, team, month) do
    message_data = Reader.get_message_data_for_month(team, month)
    # [%{group_id: 1, group_name: "name", messages: %{"2017-02-01" => [...]}}, ...] = message_data
    write_messages_for_groups(directory, message_data)
  end

  defp write_messages_for_groups(_, message_data) when message_data == [], do: []
  defp write_messages_for_groups(directory, message_data) do
    for group <- message_data do
      write_messages_for_group(directory, group)
    end
  end

  defp write_messages_for_group(directory, group) do
    directory
    |> Path.join(group.group_name)
    |> File.mkdir # makes sure group directory exists
    # %{"2017-05-03" => [...], ...} = List.first(group.messages)
    for {date, messages} <- group.messages do
      write_messages_for_day(directory, group.group_name, date, messages)
    end
  end

  defp write_messages_for_day(directory, group_name, date, messages) do
    path = Path.join(directory, "#{group_name}/#{date}.json")
    json = Poison.encode_to_iodata!(messages, pretty: true)
    with :ok <- File.write(path, json) do
      path
    end
  end

  @doc """
  Returns the months in between a given start and end datetimes.

  ## Examples:

      iex> {:ok, start_at} = NaiveDateTime.new(2017, 1, 1, 0, 0, 0)
      iex> {:ok, end_at}  = NaiveDateTime.new(2017, 4, 1, 0, 0, 0)
      iex> list_target_months(start_at, end_at)
      [{2017, 1}, {2017, 2}, {2017, 3}, {2017, 4}]

  """
  @spec list_target_months(NaiveDateTime.t, NaiveDateTime.t) :: [{pos_integer, pos_integer}]
  def list_target_months(start_at, end_at) do
    start_at
    |> Timex.beginning_of_month()
    |> (fn beginning -> [{beginning.year, beginning.month}] end).()
    |> add_next_month_until_end_at(end_at)
  end

  defp add_next_month_until_end_at(months, :the_end), do: months
  defp add_next_month_until_end_at([{year, month} | _] = months, %{year: end_year, month: end_month} = _end_at)
  when (year == end_year) and (month == end_month) do
    add_next_month_until_end_at(months, :the_end)
  end
  defp add_next_month_until_end_at([{year, month} | _] = months, end_at) when month == 12 do
    add_next_month_until_end_at([{(year + 1), 1} | months], end_at)
  end
  defp add_next_month_until_end_at([{year, month} | _] = months, end_at) when month < 12 do
    add_next_month_until_end_at([{year, (month + 1)} | months], end_at)
  end
end
