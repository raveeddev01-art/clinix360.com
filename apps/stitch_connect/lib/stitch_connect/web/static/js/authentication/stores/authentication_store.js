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

const authenticationStore = new AuthenticationStore(props);
export default authenticationStore;
