defmodule Stitch.Web.Api.V1.InvitationDocs do
  use PhoenixSwagger

  defmacro __using__(_) do
    quote do
      swagger_path :patient_accept do
        post("/api/v1/patient/invitations/accept/{token}")
        produces("application/json")

        description("Accepts an invitation and completes patient onboarding.")

        parameters do
          token(
            :query,
            :string,
            "invite_token on the invitation sent to the patient"
          )

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

          pin(
            :query,
            :string,
            "4 digit PIN for the patient."
          )

          password(
            :query,
            :string,
            "Patient's password."
          )
        end

        response(200, "OK", Schema.ref(:PatientOnboardingCompletion))
      end
    end
  end
end
