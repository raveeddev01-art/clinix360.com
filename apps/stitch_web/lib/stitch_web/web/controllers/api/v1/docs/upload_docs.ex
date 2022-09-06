defmodule Stitch.Web.Api.V1.UploadDocs do
  use PhoenixSwagger
  alias Stitch.Web.Api.V1.Docs.CommonParams

  defmacro __using__(_) do
    quote do
      # swagger_path :patient_create do
      #   post("/api/v1/patient/upload-signature")
      #   produces("application/json")

      #   description("As a patient, get credentials to upload a file given a name and mimetype.")

      #   CommonParams.auth()

      #   parameters do
      #     filename(
      #       :query,
      #       :string,
      #       "Name of the file to upload."
      #     )

      #     mimetype(
      #       :query,
      #       :string,
      #       "Mimetype of the file to upload."
      #     )
      #   end

      #   response(200, "OK", Schema.ref(:UploadSignature))
      # end

      swagger_path :create do
        post("/api/v1/upload-signature")
        produces("application/json")

        description("As a user, get credentials to upload a file given a name and mimetype..")

        CommonParams.auth()

        parameters do
          filename(
            :query,
            :string,
            "Name of the file to upload."
          )

          mimetype(
            :query,
            :string,
            "Mimetype of the file to upload."
          )
        end

        response(200, "OK", Schema.ref(:UploadSignature))
      end
    end
  end
end
