import { observable, action } from "mobx";

class LayoutStore {
  @observable showAddons = false;

  @action
  toggleAddons = value => {
    if (typeof value !== "undefined") {
      this.showAddons = value;
    } else {
      this.showAddons = !this.showAddons;
    }
  };
}

const store = new LayoutStore();
export default store;
