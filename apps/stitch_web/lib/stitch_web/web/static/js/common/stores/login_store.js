import { observable, action, computed } from "mobx";

class LoginStore {
  @observable teams = [];

  constructor(rootStore, appParams) {
    this.rootStore = rootStore;
    this.teams = appParams.teams || [];
  }

  @computed
  get hasLogin() {
    return this.teams.length > 0;
  }
}

export default LoginStore;
