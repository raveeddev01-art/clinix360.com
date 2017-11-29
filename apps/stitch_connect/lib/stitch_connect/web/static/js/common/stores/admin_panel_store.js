import { observable, action } from "mobx";

class AdminPanelStore {
  @observable heading = "";
  @observable icon = "";

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  setHeading = (heading, icon) => {
    this.heading = heading;
    this.icon = icon;
  };
}

export default AdminPanelStore;
