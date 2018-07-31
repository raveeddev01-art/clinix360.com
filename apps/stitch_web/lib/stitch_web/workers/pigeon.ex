defmodule Stitch.Pigeon do
  # iOS
  def apns_config do
    Pigeon.APNS.Config.new(
      name: :apns_default,
      mode: "APNS_MODE" |> System.get_env() |> String.to_atom(),
      cert: "APNS_CERT_B64" |> System.get_env() |> Base.decode64!(),
      key: "APNS_KEY_B64" |> System.get_env() |> Base.decode64!(),
      reconnect: false,
      port: 2197,
      ping_period: 300_000
    )
  end

  def engage_apns_config do
    # workaround becase we can't pass cert as a string
    cert_content = (System.get_env("ENGAGE_APNS_CERT_B64") || "") |> Base.decode64!()
    key_content = (System.get_env("ENGAGE_APNS_KEY_B64") || "") |> Base.decode64!()
    cert_path = Path.join([Application.app_dir(:stitch, "priv"), "engage_apns.cert"])
    File.write!(cert_path, cert_content)

    Pigeon.APNS.Config.new(
      name: :apns_engage,
      mode: (System.get_env("ENGAGE_APNS_MODE") || "prod") |> String.to_atom(),
      cert: cert_path,
      key: key_content,
      reconnect: false,
      port: 2197,
      ping_period: 300_000
    )
  end

  # Android
  def fcm_config do
    Pigeon.FCM.Config.new(
      name: :fcm_default,
      key: System.get_env("FCM_KEY")
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
