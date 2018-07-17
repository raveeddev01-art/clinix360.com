import { observable } from "mobx";

class ResetPasswordStore {
  @observable token = "";

  sendEmail = email => {
    return post(`/api/v1/reset_password`, {
      body: {
        email
      },
      hideNotify: true
    });
  };

  resetPassword = password => {
    return post(`/api/v1/reset_password`, {
      body: { token: this.token, password },
      hideNotify: true
    });
  };
}

const store = new ResetPasswordStore();
export default store;
