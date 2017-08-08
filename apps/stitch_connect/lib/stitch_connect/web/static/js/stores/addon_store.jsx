import { observable, action } from "mobx";

class AddonStore {
  @observable showAddons = false;
  @observable showAddonDetail = false;
  @observable detailPanelType = null;
  @observable detailPanelItem = null;

  @action
  toggleAddons = value => {
    if (typeof value !== "undefined") {
      this.showAddons = value;
    } else {
      this.showAddons = !this.showAddons;
    }
  };

  @action
  toggleAddonDetail = (detailType, detailItem) => {
    this.showAddonDetail = !this.showAddonDetail;
    if (detailType || detailItem) {
      this.detailPanelType = detailType;
      this.detailPanelItem = detailItem;
    }
  };
}

const store = new AddonStore();
export default store;
