import { observable, computed } from "mobx";

class AuthenticationStore {
  @observable userId = "";
  @observable firstName = "";
  @observable lastName = "";
  @observable username = "";
  @observable password = "";
  @observable pin = "";

  @observable teamName = "";
  @observable teamId = "";
  @observable teamSlug = "";

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
