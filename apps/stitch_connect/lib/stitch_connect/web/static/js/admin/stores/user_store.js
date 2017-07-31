import { observable, action } from "mobx";

class UserStore {
  @observable id = "";
  @observable loading = false;
  @observable username = "";
  @observable phone = "";
  @observable title = "";
  @observable email = "";
  @observable firstName = "";
  @observable lastName = "";

  @action
  loadUser = id => {
    this.loading = true;
    this.id = id;

    get(`/api/v1/users/${id}`).then(resp => {
      const { data } = resp;
      this.username = data.username;
      this.phone = data.phone;
      this.title = data.title;
      this.email = data.email;
      this.firstName = data.firstName;
      this.lastName = data.lastName;

      this.loading = false;
    });
  };

  @action
  save = data => {
    return put(`/api/v1/users/${this.id}`, {
      body: data
    });
  };

  @action
  saveUsername = username => {
    this.save({ username }).then(() => {
      this.username = username;
      notify.show("Username updated");
    });
  };
}

const userStore = new UserStore();
export default userStore;
