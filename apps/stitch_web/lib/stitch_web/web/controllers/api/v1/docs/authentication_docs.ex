defmodule Stitch.Web.Api.V1.AuthenticationDocs do
  use PhoenixSwagger

  defmacro __using__(_) do
    quote do
      # CARESPACE ROUTES
      swagger_path :submit_patient_login do
        post("/api/v1/patient/login")
        produces("application/json")

        description(
          "Logs a patient in. Returns Patient info including redirect_url and token for future api calls."
        )

        parameters do
          email(
            :query,
            :string,
            "Email for the patient."
          )

          password(
            :query,
            :string,
            "Password for the patient."
          )
        end

        # response(200, "OK", Schema.ref(:PatientLogin))
        response(200, "OK")
      end

      swagger_path :patient_reset_password do
        post("/api/v1/patient/reset_password")
        produces("application/json")

        description(
          "If posted with an email param, sends a password reset email with token. If posted with token and new password, resets password."
        )

        parameters do
          email(
            :query,
            :string,
            "Patients email (sent without other params)"
          )

          token(
            :query,
            :string,
            "Password reset token (sent with password param - not email param)"
          )

          password(
            :query,
            :string,
            "Password for the user (sent with token param - not email param)"
          )
        end

        response(200, "ok")
      end
    end
  end
end
