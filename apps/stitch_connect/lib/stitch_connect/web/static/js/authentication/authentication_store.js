import { observable, computed } from "mobx";

class AuthenticationStore {
  @observable userId = "";
  @observable teamName = "";
  @observable fullname = "";
  @observable username = "";
  @observable password = "";
  @observable pin = "";

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
