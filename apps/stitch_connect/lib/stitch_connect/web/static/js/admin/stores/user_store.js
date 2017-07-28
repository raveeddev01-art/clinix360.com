import { observable, action } from "mobx";

class UserStore {
  @observable name = "";
  @observable id = "";

  constructor(props) {}
}

let userStore;
const store = {
  instance() {},
  get instance() {
    return userStore;
  },
  set instance(props) {
    userStore = new UserStore(props);
  }
};

export default store;
export { UserStore };
