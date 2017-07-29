import { observable, action } from "mobx";

class UserStore {
  @observable id = "";
  @observable data = {};

  @action loadUser = id => {};

  @action
  setDataField = (field, value) => {
    this.data[field] = value;
  };
}

const userStore = new UserStore();
export default userStore;
