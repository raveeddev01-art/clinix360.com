import { observable } from "mobx";

class ResetPasswordStore {
  @observable token = "";

  sendEmail = email => {
    return post(`/api/v1/reset_password`, {
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
    return post(`/api/v1/reset_password`, {
      body: { token: this.token, password }
    }).then(() => {
      notify.show("Your password has been reset.");
    });
  };
}

const store = new ResetPasswordStore();
export default store;
