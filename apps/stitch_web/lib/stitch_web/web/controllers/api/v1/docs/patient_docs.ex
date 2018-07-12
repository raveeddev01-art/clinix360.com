defmodule Stitch.Web.Api.V1.PatientDocs do
  use PhoenixSwagger
  alias Stitch.Web.Api.V1.Docs.CommonParams

  defmacro __using__(_) do
    quote do
      swagger_path :update_as_patient do
        put("/api/v1/patient/info")
        produces("application/json")

        description("Updates patient info as the patient.")

        CommonParams.auth()

        parameters do
          first_name(
            :query,
            :string,
            "First name of the patient."
          )

          last_name(
            :query,
            :string,
            "Last name of the patient."
          )

          phone_number(
            :query,
            :string,
            "Patient's phone number."
          )
        end

        response(200, "OK", Schema.ref(:Patient))
      end
    end
  end
end
