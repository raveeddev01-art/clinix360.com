defmodule StitchConnect.Pigeon do
  # iOS
  def apns_config do
    Pigeon.APNS.Config.new(
      name: :apns_default,
      mode: :prod,
      cert: System.get_env("APNS_CERT"),
      key: System.get_env("APNS_KEY"),
      reconnect: false,
      port: 2197,
      ping_period: 300_000
    )
  end

  # Android
  def fcm_config do
    Pigeon.FCM.Config.new(
      name: :fcm_default,
      mode: :prod,
      key: System.get_env("FCM_KEY"),
      reconnect: false,
      port: 2197,
      ping_period: 300_000
    )
  end

  # Amazon Android
  def adm_config do
    Pigeon.ADM.Config.new(
      name: :adm_default,
      mode: :prod,
      client_id: System.get_env("ADM_CLIENT_ID"),
      client_secret: System.get_env("ADM_CLIENT_SECRET"),
      reconnect: false,
      port: 2197,
      ping_period: 300_000
    )
  end
end