defmodule Stitch.Util.UserAgentInfo do
  use ExUnit.Case, async: true

  setup do
    {:ok,
     ios_app:
       "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1",
     android_app:
       "Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/60.0.3112.107 Mobile Safari/537.36",
     windows_edge:
       "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10136",
     mac_chrome:
       "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36",
     unknown: "FooBar Gibberish 10.0"}
  end

  test "UserAgentInfo.device_type/1", %{
    ios_app: ios_app,
    android_app: android_app,
    windows_edge: windows_edge,
    mac_chrome: mac_chrome,
    unknown: unknown
  } do
    assert UserAgentInfo.device_type(android_app) == "smartphone"
    assert UserAgentInfo.device_type(ios_app) == "smartphone"
    assert UserAgentInfo.device_type(windows_edge) == "desktop"
    assert UserAgentInfo.device_type(mac_chrome) == "desktop"
    assert UserAgentInfo.device_type(unknown) == "unknown"
  end

  test "UserAgentInfo.client_name/1", %{
    ios_app: ios_app,
    android_app: android_app,
    windows_edge: windows_edge,
    mac_chrome: mac_chrome,
    unknown: unknown
  } do
    assert UserAgentInfo.client_name(ios_app) == "iOS App"
    assert UserAgentInfo.client_name(android_app) == "Android App"
    assert UserAgentInfo.client_name(windows_edge) == "Microsoft Edge"
    assert UserAgentInfo.client_name(mac_chrome) == "Chrome"
    assert UserAgentInfo.client_name(unknown) == "unknown"
  end

  test "UserAgentInfo.os/1", %{
    ios_app: ios_app,
    android_app: android_app,
    windows_edge: windows_edge,
    mac_chrome: mac_chrome,
    unknown: unknown
  } do
    assert UserAgentInfo.os(ios_app) == "iOS"
    assert UserAgentInfo.os(android_app) == "Android"
    assert UserAgentInfo.os(windows_edge) == "Windows"
    assert UserAgentInfo.os(mac_chrome) == "Mac"
    assert UserAgentInfo.os(unknown) == "unknown"
  end
end
