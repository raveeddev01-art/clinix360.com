import { observable } from "mobx";

class AuthenticationStore {
  @observable userId = "";
  @observable email = "";
  @observable firstName = "";
  @observable lastName = "";
  @observable username = "";
  @observable password = "";
  @observable pin = "";

  @observable teamName = "";
  @observable teamSlug = "";
  @observable teamId = "";
  @observable teamUrl = "";

  constructor(props) {
    this.teamName = props.teamName;
    this.teamSlug = props.teamSlug;
  }
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
