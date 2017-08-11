import { observable, action } from "mobx";

class AddonStore {
  @observable showAddons = false;
  @observable showAddonDetail = false;
  @observable addonPanelType = null;
  @observable addonPanelData = null;
  @observable detailPanelType = null;
  @observable detailPanelData = null;

  @action
  toggleAddons(value) {
    if (typeof value !== "undefined") {
      this.showAddons = value;
    } else {
      this.showAddons = !this.showAddons;
    }
  }

  @action
  setAddonPanel(panelType, panelData) {
    if (panelType || panelData) {
      this.addonPanelType = panelType;
      this.addonPanelData = panelData;
    }
  }

  @action
  toggleAddonDetail() {
    this.showAddonDetail = !this.showAddonDetail;
  }

  @action
  setAddonDetailPanel(panelType, panelData){
    if (panelType || panelData) {
      this.detailPanelType = panelType;
      this.detailPanelData = panelData;
    }
  }

}

export default AddonStore;
