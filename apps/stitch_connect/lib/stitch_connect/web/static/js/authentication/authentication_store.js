import { observable, computed } from "mobx";

class AuthenticationStore {
  @observable userId = "";

  constructor() {}
}

var authenticationStore;

const store = {
  instance() {},
  get instance() {
    return authenticationStore;
  },
  set instance(props) {
    authenticationStore = new AuthenticationStore(props);
  }
};

export default store;
export { AuthenticationStore };
