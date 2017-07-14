import { observable, computed } from "mobx";

class SidemenuStore {
  @observable teamName = "";
  @observable subdomain = "";
  @observable teamId = "";

  constructor(props) {
    this.teamName = props.teamName;
    this.teamId = props.teamId;
    this.subdomain = props.subdomain;
  }
}

var sidemenuStore;

const store = {
  instance() {},
  get instance() {
    return sidemenuStore;
  },
  set instance(props) {
    sidemenuStore = new SidemenuStore(props);
  }
};

export default store;
export { SidemenuStore };
