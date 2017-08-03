import { observable } from "mobx";

class ResetPasswordStore {
  @observable token = "";
  @observable teamId = "";

  sendEmail = email => {
    return post(`/api/v1/reset-password`, {
      body: {
        email
      }
    }).then(() => {
      notify.show(
        "Reset password email has been sent. Please check your inbox."
      );
    });
  };

  resetPassword = password => {
    return post(`/api/v1/reset-password/${token}`, {
      body: { password }
    }).then(() => {
      notify.show("Your password has been reset.");
      window.location.href = `https://${subdomain}.${applicationHost}/login`;
    });
  };
}

const store = new ResetPasswordStore();
export default store;
