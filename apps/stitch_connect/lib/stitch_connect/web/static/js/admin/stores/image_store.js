class ImageStore {
  uploadImage = (file, key) => {
    return post("/api/v1/upload-signature", {
      body: {
        filename: key,
        mimetype: file.type
      }
    }).then(resp => {
      const { data } = resp;
      const formData = new FormData();
      formData.append("AWSAccessKeyId", data.AWSAccessKeyId);
      formData.append("key", data.key);
      formData.append("Content-Type", data["Content-Type"]);
      formData.append("acl", data.acl);
      formData.append("success_action_status", data.success_action_status);
      formData.append("policy", data.policy);
      formData.append("signature", data.signature);
      formData.append("file", file);
      console.log(resp.data);

      return fetch(data.action, {
        body: formData,
        method: "POST",
        mode: "cors"
      })
        .then(() => {
          return `${data.action}/${data.key}`;
        })
        .catch(() => {
          notify.show("There was a problem uploading image", "error");
        });
    });
  };
}

const imageStore = new ImageStore();
export default imageStore;
