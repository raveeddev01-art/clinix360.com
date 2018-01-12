defmodule StitchConnect.MessageLinkPreviewGeneratorTest do
  use ExUnit.Case, async: false
  import ExUnit.CaptureLog
  import Stitch.Factory

  alias StitchConnect.MessageLinkPreview
  alias Stitch.Message

  def await_queued_work do
    receive do
      {:preview_generated, _} -> await_queued_work()
    after 100 -> :ok
    end
  end

  setup _config do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
    Ecto.Adapters.SQL.Sandbox.mode(Stitch.Repo, {:shared, self()})
  end

  describe "with ungenerated messages" do
    setup config do
      messages = [
        insert(:message, has_links: true, link_previews_generated: false),
        insert(:message, has_links: false, link_previews_generated: false),
        insert(:message, has_links: false, link_previews_generated: true),
        insert(:message, has_links: true, link_previews_generated: true),
      ]

      {:ok, pid} = MessageLinkPreview.Supervisor.start_link(
        generate_pending?: true,
        name: config.test,
        subscriber: self())

      {:ok, sup: pid, messages: messages}
    end

    test "generates previews at startup for ungenerated links",
      %{messages: [%Message{id: id1} | _]} do

      assert_receive {:preview_generated, ^id1}
      refute_receive {:preview_generated, _}
    end
  end

  describe "on-demand preview generation" do
    setup config do
      {:ok, pid} = MessageLinkPreview.Supervisor.start_link(
        generate_pending?: true,
        name: config.test,

        subscriber: self())

      {:ok, sup: pid}
    end

    test "queues messages for generation against sharded pool", config do
      1..MessageLinkPreview.Supervisor.max_buffer_size()
      |> Enum.map(fn _ ->
        Task.async(fn ->
          msg = insert(:message,
            has_links: true,
            link_previews_generated: false)

          assert :ok = MessageLinkPreview.queue(config.test, msg)
          msg
        end)
      end)
      |> Enum.map(fn task ->
        %Message{id: id} = Task.await(task)
        id
      end)
      |> Enum.map(fn id ->
        assert_receive {:preview_generated, ^id}
      end)

      await_queued_work()
    end
  end

  describe "overload protection" do
    setup config do
      {:ok, pid} = MessageLinkPreview.Supervisor.start_link(
        generate_pending?: true,
        name: config.test,
        setup_async_child: fn _, _ -> :timer.sleep(100) end,
        subscriber: self())

      {:ok, sup: pid}
    end

    test "protects from overload with back-presure", config do
      msg = insert(:message,
        has_links: true,
        link_previews_generated: false)

      for _ <- 0..MessageLinkPreview.Supervisor.max_buffer_size(), config do
        assert :ok = MessageLinkPreview.queue(config.test, msg)
      end

      assert capture_log(fn ->
        assert {:error, :buffer_limit_reached, _} =
          MessageLinkPreview.queue(config.test, msg)
      end) =~ "exceeded buffer limit"

      await_queued_work()
    end
  end
end
