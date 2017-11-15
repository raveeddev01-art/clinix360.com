import { observable, action } from "mobx";

class AdminPanelStore {
  @observable heading = "";

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  setHeading = heading => {
    this.heading = heading;
  };
}

export default AdminPanelStore;
