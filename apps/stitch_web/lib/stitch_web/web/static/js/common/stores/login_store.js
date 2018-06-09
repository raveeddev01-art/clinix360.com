import { observable, action, computed } from "mobx";

class LoginStore {
  @observable teams = [];

  constructor(rootStore, appParams) {
    this.rootStore = rootStore;
    this.teams = appParams.teams || [];
  }

  @computed
  get hasLogin() {
    console.log("hasLogin")
    console.log(this.teams)
    return this.teams.length > 0;
  }
}

export default LoginStore;
