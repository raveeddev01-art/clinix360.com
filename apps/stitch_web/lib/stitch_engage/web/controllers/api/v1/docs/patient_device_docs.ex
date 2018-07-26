defmodule Stitch.Web.Api.V1.PatientDeviceDocs do
  use PhoenixSwagger
  alias Stitch.Web.Api.V1.Docs.CommonParams

  defmacro __using__(_) do
    quote do
      swagger_path :create do
        post("/api/v1/patient/devices")
        produces("application/json")

        description("Registeres device token.")

        parameters do
          type(
            :query,
            :string,
            "The device type (ios or android)",
            enum: [:ios, :android],
            example: "ios",
            required: true
          )

          token(
            :query,
            :string,
            "The device token",
            example: "03df25c845d460bcdad7802d2vf6fc1dfde97283bf75cc993eb6dca835ea2e2f",
            required: true
          )
        end

        CommonParams.auth()
      end

      swagger_path :delete do
        post("/api/v1/patient/devices/unregister")
        produces("application/json")

        description("Remove the registered patient mobile device")

        CommonParams.auth()

        parameters do
          type(
            :query,
            :string,
            "The device type (ios or android)",
            enum: [:ios, :android],
            example: "ios",
            required: true
          )

          token(
            :query,
            :string,
            "The device token",
            example: "03df25c845d460bcdad7802d2vf6fc1dfde97283bf75cc993eb6dca835ea2e2f",
            required: true
          )
        end
      end
    end
  end
end
