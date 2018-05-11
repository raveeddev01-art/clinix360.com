import { observable, action } from "mobx";

class AddonStore {
  @observable showAddons = false;
  @observable showAddonDetail = false;
  @observable addonPanelType = null;
  @observable addonPanelData = null;
  @observable detailPanelType = null;
  @observable detailPanelData = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  toggleAddons(value) {
    if (typeof value !== "undefined") {
      this.showAddons = value;
    } else {
      this.showAddons = !this.showAddons;
    }

    // when addon panel is closed, collapse pin msgs
    if (!this.showAddons) {
      this.rootStore.pinnedMessageStore.onCollapse(false);
      this.rootStore.filesStore.onCollapseChange(false);
    }
  }

  @action
  setAddonPanel(panelType, panelData) {
    if (panelType || panelData) {
      this.addonPanelType = panelType;
      this.addonPanelData = panelData;
    }

    this.showAddonDetail = false;

    switch (this.addonPanelType) {
      case "starred":
        this.rootStore.globalStarredMessageStore.loadStarredMessages();
        break;

      case "mentions":
        this.rootStore.mentionsStore.loadMore();
        break;

      case "files":
        this.rootStore.globalFilesStore.loadMore();
        this.rootStore.filesStore.onCollapseChange();
        break;

      default:
    }
  }

  @action
  toggleAddonDetail(value) {
    if (typeof value !== "undefined") {
      this.showAddonDetail = value;
    } else {
      this.showAddonDetail = !this.showAddonDetail;
    }
  }

  @action
  setAddonDetailPanel(panelType, panelData) {
    if (panelType || panelData) {
      this.detailPanelType = panelType;
      this.detailPanelData = panelData;
    }
  }
}

export default AddonStore;
