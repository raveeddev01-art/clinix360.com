defmodule Stitch.Web.Api.V1.FindYourTeamDocs do
  use PhoenixSwagger

  defmacro __using__(_) do
    quote do
      # IN-CARESPACE ROUTES

      swagger_path :patient_create do
        post("/api/v1/patient/find-your-team")
        produces("application/json")

        description("Sends a find your team email to a patient.")

        parameters do
          email(
            :query,
            :string,
            "Patient's email."
          )
        end

        response(200, "OK")
      end

      swagger_path :patient_delete do
        PhoenixSwagger.Path.delete("/api/v1/patient/find-your-team/{token}")
        produces("application/json")

        description(
          "Given a valid find team token, returns a valid login token and list of teams."
        )

        parameters do
          token(
            :path,
            :string,
            "Find your team token - found in the email."
          )
        end

        response(200, "OK", Schema.ref(:FindTeamLogin))
      end
    end
  end
end
