import { observable } from "mobx";

class ResetPasswordStore {
  @observable token = "";

  sendEmail = (email, asPatient) => {
    const resetPath = asPatient
      ? "/api/v1/patient/reset_password"
      : "/api/v1/reset_password";

    return post(resetPath, {
      body: {
        email
      },
      hideNotify: true
    });
  };

  resetPassword = (password, asPatient) => {
    const resetPath = asPatient
      ? "/api/v1/patient/reset_password"
      : "/api/v1/reset_password";

    return post(resetPath, {
      body: { token: this.token, password },
      hideNotify: true
    });
  };
}

const store = new ResetPasswordStore();
export default store;
