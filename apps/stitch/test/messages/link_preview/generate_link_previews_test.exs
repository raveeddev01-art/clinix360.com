defmodule GenerateLinkPreviewsTest.Helpers do
  use Stitch.DataCase

  def get_by_id(model, id) do
    Stitch.Repo.get(model, id)
  end

  def insert_model(Stitch.Message, params), do: insert(:message, params)

  def insert_model(Stitch.Engage.ConversationMessage, params),
    do: insert(:conversation_message, params)

  def test_with_og_metadata(model) do
    message = insert_model(model, text_content: "lorem https://reactjs.org ipsum")

    Stitch.Message.LinkPreview.generate_link_previews(message)

    message = get_by_id(model, message.id)

    assert message.link_previews_generated
    assert [link_preview] = message.link_previews
    assert link_preview.link == "https://reactjs.org"
    assert link_preview.title == "React - A JavaScript library for building user interfaces"
    assert link_preview.description == "A JavaScript library for building user interfaces"
    assert link_preview.favicon_url == "https://reactjs.org/favicon.ico"
    assert link_preview.image_url == "https://reactjs.org/logo-og.png"
  end

  def test_with_link_that_redirects(model) do
    message = insert_model(model, text_content: "lorem https://www.google.com ipsum")

    Stitch.Message.LinkPreview.generate_link_previews(message)

    message = get_by_id(model, message.id)
    assert message.link_previews_generated
    assert [link_preview] = message.link_previews
    assert link_preview.link == "https://www.google.com"
    assert link_preview.title == "Google"
  end

  def test_with_over_five_links(model) do
    message =
      insert_model(
        model,
        text_content: """
        https://www.youtube.com/watch?v=3tmd-ClpJxA
        https://www.youtube.com/watch?v=uo14xGYwWd4
        https://www.youtube.com/watch?v=J_ub7Etch2U
        https://www.youtube.com/watch?v=OrSadmwmmAs
        https://www.youtube.com/watch?v=iKzRIweSBLA
        https://www.youtube.com/watch?v=PEGccV-NOm8
        """
      )

    Stitch.Message.LinkPreview.generate_link_previews(message)

    message = get_by_id(model, message.id)
    assert message.link_previews_generated
    assert message.link_previews == []
  end

  def test_with_unreachable_link(model) do
    message = insert_model(model, text_content: "lorem https://foo.com ipsum")

    Stitch.Message.LinkPreview.generate_link_previews(message)

    message = get_by_id(model, message.id)
    assert message.link_previews_generated
    assert message.link_previews == []
  end

  def test_with_link_without_metadata(model) do
    message =
      insert_model(model, text_content: "lorem http://home.mcom.com/home/welcome.html ipsum")

    Stitch.Message.LinkPreview.generate_link_previews(message)

    message = get_by_id(model, message.id)
    assert message.link_previews_generated
    assert message.link_previews == []
  end

  def test_with_invalid_link(model) do
    message =
      insert_model(
        model,
        text_content: "lorem http://%00%00c:/../../../../windows/system32/calc.exe ipsum"
      )

    Stitch.Message.LinkPreview.generate_link_previews(message)

    message = get_by_id(model, message.id)
    assert message.link_previews_generated
    assert message.link_previews == []
  end
end

defmodule Stitch.Message.LinkPreview.GenerateLinkPreviewsTest do
  alias GenerateLinkPreviewsTest.Helpers
  use Stitch.DataCase

  describe "messages" do
    test "message with a link with OG metadata" do
      Helpers.test_with_og_metadata(Stitch.Message)
    end

    test "message with a link that redirects" do
      Helpers.test_with_link_that_redirects(Stitch.Message)
    end

    test "message with more than 5 links" do
      Helpers.test_with_over_five_links(Stitch.Message)
    end

    test "message with a link that can't be reached" do
      Helpers.test_with_unreachable_link(Stitch.Message)
    end

    test "message with a link without metadata" do
      Helpers.test_with_link_without_metadata(Stitch.Message)
    end

    test "message with an invalid link" do
      Helpers.test_with_invalid_link(Stitch.Message)
    end
  end

  describe "conversation_messages" do
    test "message with a link with OG metadata" do
      Helpers.test_with_og_metadata(Stitch.Engage.ConversationMessage)
    end

    test "message with a link that redirects" do
      Helpers.test_with_link_that_redirects(Stitch.Engage.ConversationMessage)
    end

    test "message with more than 5 links" do
      Helpers.test_with_over_five_links(Stitch.Engage.ConversationMessage)
    end

    test "message with a link that can't be reached" do
      Helpers.test_with_unreachable_link(Stitch.Engage.ConversationMessage)
    end

    test "message with a link without metadata" do
      Helpers.test_with_link_without_metadata(Stitch.Engage.ConversationMessage)
    end

    test "message with an invalid link" do
      Helpers.test_with_invalid_link(Stitch.Engage.ConversationMessage)
    end
  end

  # test "message with a link to a pdf" do
  #   link = "https://s3.amazonaws.com/stitch-content-public/test-files/test.pdf"

  #   message = insert(:message, text_content: "lorem #{link} ipsum")

  #   Stitch.Message.LinkPreview.generate_link_previews(message)

  #   message = Stitch.MessageQueries.get_by_id(message.id)
  #   assert message.link_previews_generated
  #   assert [%Stitch.Message.LinkPreview{}] = message.link_previews
  # end
end
