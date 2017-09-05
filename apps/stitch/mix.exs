defmodule Stitch.Mixfile do
  use Mix.Project

  def project do
    [app: :stitch,
     version: "0.1.0",
     build_path: "../../_build",
     config_path: "../../config/config.exs",
     deps_path: "../../deps",
     lockfile: "../../mix.lock",
     elixir: "~> 1.4",
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
     deps: deps(),
     elixirc_paths: elixirc_paths(Mix.env)]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  def application do
    # Specify extra applications you'll use from Erlang/Elixir
    [extra_applications: [:logger],
     mod: {Stitch.Application, []}]
  end

  defp deps do
    [
      {:ecto, "~> 2.2"},
      {:postgrex, "~> 0.13.3"},
      {:comeonin, "~> 3.0"},
      {:ex_machina, "~> 2.1", only: :test},
      {:slugger, "~> 0.2"},
      {:bamboo, "~> 0.8"},
      {:ex_doc, "~> 0.14", only: :dev, runtime: false}
    ]
  end
end
