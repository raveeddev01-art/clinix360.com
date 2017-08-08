import { observable, action } from "mobx";

class LayoutStore {
  @observable showAddons = false;
  @observable showAddonDetail = false;

  @action
  toggleAddons = value => {
    if (typeof value !== "undefined") {
      this.showAddons = value;
    } else {
      this.showAddons = !this.showAddons;
    }
  };

  @action
  toggleAddonDetail = () => {
    this.showAddonDetail = !this.showAddonDetail;
  };
}

const store = new LayoutStore();
export default store;
