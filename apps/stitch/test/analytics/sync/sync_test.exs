defmodule Stitch.Analytics.SyncTest do
  use Stitch.DataCase
  alias Stitch.Analytics
  alias Stitch.Analytics.Sync

  @segment_api Application.get_env(:stitch, :segment_api)

  test "perform/0 pushes events to Segment" do
    user_id_1 = 123
    user_id_2 = 456
    event_1 = "some event"
    event_2 = "other event"
    props_1 = %{
      "some_prop"   => "some prop value for event 1",
      "room_other_prop" => "some other prop value for event 1",
    }
    props_2 = %{
      "some_prop"   => "some prop value for event 2",
      "room_other_prop" => "some other prop value for event 2",
    }
    Analytics.track(user_id_1, event_1, props_1)
    Analytics.track(user_id_2, event_2, props_2)

    Sync.perform()

    [payload] = @segment_api.list_all()
    decoded_payload = Poison.decode!(payload)
    batch = decoded_payload["batch"]
    payload_1 = List.first(batch)
    payload_2 = List.last(batch)
    assert length(batch) == 2
    assert payload_1["userId"] == Integer.to_string(user_id_1)
    assert payload_2["userId"] == Integer.to_string(user_id_2)
    assert payload_1["event"] == event_1
    assert payload_2["event"] == event_2
    assert payload_1["properties"] == props_1
    assert payload_2["properties"] == props_2
    assert Analytics.list_events() == [] # assert table on Stitch DB is empty
  end
end
