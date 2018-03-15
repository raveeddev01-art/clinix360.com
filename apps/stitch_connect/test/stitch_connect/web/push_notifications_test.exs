defmodule StitchConnect.Web.PushNotificationsTest do
  use Stitch.DataCase, async: true
  alias Pigeon.{APNS, FCM}
  alias Stitch.Mobile.Device
  alias StitchConnect.Web.PushNotifications

  setup do
    Application.put_env(:stitch_connect, :apns_push, &push/2)
    Application.put_env(:stitch_connect, :fcm_push, &push/2)
  end

  def push(notification, opts) do
    [{:on_response, on_response} | []] = opts
    assert is_function(on_response, 1)
    send(self(), notification)
  end

  describe "push_badge_update_to_user/1" do
    test "when user has no mobile devices" do
      user = insert(:user)

      PushNotifications.push_badge_update_to_user(user)

      refute_receive []
      refute_receive %FCM.Notification{registration_id: []}
      refute_receive _
    end

    test "when user has mobile devices" do
      user = insert(:user)
      insert(:mobile_device, user: user, type: "ios", token: "ios-token")
      insert(:mobile_device, user: user, type: "ios", token: "ios-token-2")
      insert(:mobile_device, user: user, type: "android", token: "android-token")
      insert(:mobile_device, user: user, type: "android", token: "android-token-2")

      PushNotifications.push_badge_update_to_user(user)

      assert_receive [
        %APNS.Notification{
          device_token: "ios-token",
          topic: "apns-topic",
          payload: %{"aps" => %{"badge" => 0}}
        },
        %APNS.Notification{
          device_token: "ios-token-2",
          topic: "apns-topic",
          payload: %{"aps" => %{"badge" => 0}}
        }
      ]

      assert_receive %FCM.Notification{
        registration_id: ["android-token", "android-token-2"],
        payload: %{"data" => %{"badge" => "0"}}
      }

      refute_receive _
    end
  end

  describe "push_badge_update/2" do
    test "when message is a system message" do
      team = insert(:team)
      group = insert(:group, team: team)
      user = insert(:user, team: team)
      insert(:group_user, group: group, user: user)
      insert(:mobile_device, user: user)
      message = insert(:message, group: group, type: "system")

      PushNotifications.push_badge_update(message)

      refute_receive _
    end

    test "when message is not a system message" do
      team = insert(:team)
      group = insert(:group, team: team)

      user = insert(:user, team: team)
      other_user = insert(:user, team: team)
      not_in_group = insert(:user, team: team)
      excluded_user = insert(:user, team: team)
      disabled_user = insert(:user, team: team, disabled: true)

      insert(:group_user, group: group, user: user)
      insert(:group_user, group: group, user: other_user)
      insert(:group_user, user: not_in_group)
      insert(:group_user, group: group, user: excluded_user)
      insert(:group_user, group: group, user: disabled_user)

      insert(:mobile_device, user: user, type: "ios", token: "ios-token")
      insert(:mobile_device, user: user, type: "ios", token: "ios-token-2")
      insert(:mobile_device, user: user, type: "android", token: "android-token")
      insert(:mobile_device, user: user, type: "android", token: "android-token-2")
      insert(:mobile_device, user: other_user, type: "ios", token: "other-ios-token")
      insert(:mobile_device, user: other_user, type: "ios", token: "other-ios-token-2")
      insert(:mobile_device, user: other_user, type: "android", token: "other-android-token")
      insert(:mobile_device, user: other_user, type: "android", token: "other-android-token-2")
      insert(:mobile_device, user: not_in_group)
      insert(:mobile_device, user: excluded_user)
      insert(:mobile_device, user: disabled_user)

      message = insert(:message, group: group)

      PushNotifications.push_badge_update(message, [excluded_user.id])

      assert_receive [
        %APNS.Notification{
          device_token: "ios-token",
          topic: "apns-topic",
          payload: %{"aps" => %{"badge" => 0}}
        },
        %APNS.Notification{
          device_token: "ios-token-2",
          topic: "apns-topic",
          payload: %{"aps" => %{"badge" => 0}}
        }
      ]

      assert_receive %FCM.Notification{
        registration_id: ["android-token", "android-token-2"],
        payload: %{"data" => %{"badge" => "0"}}
      }

      assert_receive [
        %APNS.Notification{
          device_token: "other-ios-token",
          topic: "apns-topic",
          payload: %{"aps" => %{"badge" => 0}}
        },
        %APNS.Notification{
          device_token: "other-ios-token-2",
          topic: "apns-topic",
          payload: %{"aps" => %{"badge" => 0}}
        }
      ]

      assert_receive %FCM.Notification{
        registration_id: ["other-android-token", "other-android-token-2"],
        payload: %{"data" => %{"badge" => "0"}}
      }

      refute_receive _
    end
  end

  describe "notify_users/3" do
    test "when message is a system message" do
      team = insert(:team)
      group = insert(:group, team: team)
      user = insert(:user, team: team)
      insert(:group_user, group: group, user: user)
      insert(:mobile_device, user: user)
      message = insert(:message, group: group, type: "system")

      PushNotifications.notify_users(group, message, [user.id])

      refute_receive _
    end

    test "when message is not a system message" do
      team = insert(:team)
      group = insert(:group, team: team, name: "Foogroup")

      user = insert(:user, team: team)
      other_user = insert(:user, team: team)
      excluded_user = insert(:user, team: team)
      disabled_user = insert(:user, team: team, disabled: true)

      insert(:group_user, group: group, user: user)
      insert(:group_user, group: group, user: other_user)
      insert(:group_user, group: group, user: excluded_user)
      insert(:group_user, group: group, user: disabled_user)

      insert(:mobile_device, user: user, type: "ios", token: "ios-token")
      insert(:mobile_device, user: user, type: "ios", token: "ios-token-2")
      insert(:mobile_device, user: user, type: "android", token: "android-token")
      insert(:mobile_device, user: user, type: "android", token: "android-token-2")
      insert(:mobile_device, user: other_user, type: "ios", token: "other-ios-token")
      insert(:mobile_device, user: other_user, type: "ios", token: "other-ios-token-2")
      insert(:mobile_device, user: other_user, type: "android", token: "other-android-token")
      insert(:mobile_device, user: other_user, type: "android", token: "other-android-token-2")
      insert(:mobile_device, user: excluded_user)
      insert(:mobile_device, user: disabled_user)

      message = insert(:message, group: group)
      user_ids = [user.id, other_user.id, disabled_user.id]

      PushNotifications.notify_users(group, message, user_ids)

      assert_receive [
        %APNS.Notification{
          topic: "apns-topic",
          device_token: "ios-token",
          payload: %{
            "aps" => %{
              "alert" => "Sergio Tapia sent a room message (Foogroup).",
              "badge" => 0,
              "sound" => "chime"
            },
            :ejson => ejson
          }
        },
        %APNS.Notification{
          device_token: "ios-token-2",
          payload: %{
            :ejson => ejson,
            "aps" => %{
              "alert" => "Sergio Tapia sent a room message (Foogroup).",
              "badge" => 0,
              "sound" => "chime"
            }
          },
          topic: "apns-topic"
        }
      ]

      encoded_ejson = Poison.encode!(ejson)

      assert_receive %FCM.Notification{
          registration_id: ["android-token"],
          payload: %{
            "data" => %{
              "badge" => "0",
              "room_notification_count" => 0,
              "message" => "Sergio Tapia sent a room message (Foogroup).",
              "ejson" => ^encoded_ejson,
              "message_id" => _,
              "user_id" => _,
            }
          }
        }

      assert_receive %FCM.Notification{
          registration_id: ["android-token-2"],
          payload: %{
            "data" => %{
              "badge" => "0",
              "room_notification_count" => 0,
              "message" => "Sergio Tapia sent a room message (Foogroup).",
              "ejson" => ^encoded_ejson
            }
          }
        }

      assert_receive [
        %APNS.Notification{
          topic: "apns-topic",
          device_token: "other-ios-token",
          payload: %{
            "aps" => %{
              "alert" => "Sergio Tapia sent a room message (Foogroup).",
              "badge" => 0,
              "sound" => "chime"
            },
            :ejson => ^ejson
          }
        },
        %APNS.Notification{
          device_token: "other-ios-token-2",
          payload: %{
            :ejson => ejson,
            "aps" => %{
              "alert" => "Sergio Tapia sent a room message (Foogroup).",
              "badge" => 0,
              "sound" => "chime"
            }
          },
          topic: "apns-topic"
        }
      ]

      encoded_ejson = Poison.encode!(ejson)

      assert_receive %FCM.Notification{
        registration_id: ["other-android-token"],
        payload: %{
          "data" => %{
            "badge" => "0",
            "room_notification_count" => 0,
            "message" => "Sergio Tapia sent a room message (Foogroup).",
            "ejson" => ^encoded_ejson
          }
        }
      }

      assert_receive %FCM.Notification{
        registration_id: ["other-android-token-2"],
        payload: %{
          "data" => %{
            "badge" => "0",
            "room_notification_count" => 0,
            "message" => "Sergio Tapia sent a room message (Foogroup).",
            "ejson" => ^encoded_ejson
          }
        }
      }

      refute_receive _

      assert ejson.id == message.id
      refute Map.has_key?(ejson, :text_content)
      refute Map.has_key?(ejson, :fields)
    end

    test "when message is a room upload" do
      team = insert(:team)
      group = insert(:group, team: team, name: "Foogroup")
      user = insert(:user, team: team)
      insert(:group_user, group: group, user: user)
      insert(:mobile_device, user: user, type: "android", token: "android-token")
      message = insert(:message, group: group, type: "upload")

      PushNotifications.notify_users(group, message, [user.id])

      assert_receive %FCM.Notification{
        registration_id: ["android-token"],
        payload: %{
          "data" => %{
            "badge" => "0",
            "room_notification_count" => 0,
            "message" => "Sergio Tapia uploaded a room file (Foogroup).",
            "ejson" => _
          }
        }
      }

      refute_receive []
      refute_receive _
    end

    test "when message is a direct message" do
      team = insert(:team)
      group = insert(:group, team: team, name: "__dm_group__")
      user = insert(:user, team: team)
      insert(:group_user, group: group, user: user)
      insert(:mobile_device, user: user, type: "android", token: "android-token")
      message = insert(:message, group: group)

      PushNotifications.notify_users(group, message, [user.id])

      assert_receive %FCM.Notification{
        registration_id: ["android-token"],
        payload: %{
          "data" => %{
            "badge" => "0",
            "room_notification_count" => 0,
            "message" => "Sergio Tapia sent you a direct message.",
            "ejson" => _,
            "message_id" => _,
            "user_id" => _,
            "device_id" => _,
          }
        }
      }

      refute_receive []
      refute_receive _
    end

    test "when message is a direct upload" do
      team = insert(:team)
      group = insert(:group, team: team, name: "__dm_group__")
      user = insert(:user, team: team)
      insert(:group_user, group: group, user: user)
      insert(:mobile_device, user: user, type: "android", token: "android-token")
      message = insert(:message, group: group, type: "upload")

      PushNotifications.notify_users(group, message, [user.id])

      assert_receive %FCM.Notification{
        registration_id: ["android-token"],
        payload: %{
          "data" => %{
            "badge" => "0",
            "room_notification_count" => 0,
            "message" => "Sergio Tapia uploaded a direct file.",
            "ejson" => _,
            "message_id" => _,
            "user_id" => _,
          }
        }
      }

      refute_receive []
      refute_receive _
    end

    test "when the receiver is mentioned in a room messasge" do
      team = insert(:team)
      group = insert(:group, team: team, name: "RoomName")
      user = insert(:user, team: team)
      insert(:group_user, group: group, user: user)
      insert(:mobile_device, user: user, type: "android", token: "android-token")
      message = insert(:message, group: group, mentioned_user_ids: [user.id])

      PushNotifications.notify_users(group, message, [user.id])

      assert_receive %FCM.Notification{
        registration_id: ["android-token"],
        payload: %{
          "data" => %{
            "badge" => "0",
            "room_notification_count" => 0,
            "message" => "Sergio Tapia mentioned you in RoomName.",
            "ejson" => _
          }
        }
      }

      refute_receive []
      refute_receive _
    end
  end

  test "handle_fcm_push/1" do
    device = insert(:mobile_device, type: "android")
    device_with_invalid_token = insert(:mobile_device, type: "android")
    device_with_unregisted_token = insert(:mobile_device, type: "android")

    notification = %FCM.Notification{
      response: [
        {:success, device.token},
        {:invalid_registration, device_with_invalid_token.token},
        {:not_registered, device_with_unregisted_token.token}
      ]
    }

    PushNotifications.handle_fcm_push(notification)

    assert Repo.get(Device, device.id)
    refute Repo.get(Device, device_with_invalid_token.id)
    refute Repo.get(Device, device_with_unregisted_token.id)
  end

  describe "handle_apns_push/1" do
    test "when response is :bad_device_token" do
      device = insert(:mobile_device, type: "ios")

      notification = %APNS.Notification{response: :bad_device_token, device_token: device.token}
      PushNotifications.handle_apns_push(notification)

      refute Repo.get(Device, device.id)
    end

    test "when response is :unregistered" do
      device = insert(:mobile_device, type: "ios")

      notification = %APNS.Notification{response: :unregistered, device_token: device.token}
      PushNotifications.handle_apns_push(notification)

      refute Repo.get(Device, device.id)
    end

    test "when response is :success" do
      device = insert(:mobile_device, type: "ios")

      notification = %APNS.Notification{response: :success, device_token: device.token}
      PushNotifications.handle_apns_push(notification)

      assert Repo.get(Device, device.id)
    end
  end
end