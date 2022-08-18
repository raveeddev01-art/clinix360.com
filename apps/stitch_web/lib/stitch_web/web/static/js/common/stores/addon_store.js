import { observable, action } from "mobx";

class AddonStore {
    @observable showAddons = false;
    @observable showAddonDetail = false;
    @observable addonPanelType = null;
    @observable addonPanelData = null;
    @observable addonPanelTab = null;
    @observable detailPanelType = null;
    @observable detailPanelData = null;

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action
    updateThreadAddonPanel() {

        if(this.addonPanelType === "files" || this.addonPanelType === "thread") {
            if(this.detailPanelType === "File Details") {
                this.setAddonDetailPanel("File Details", this.detailPanelData);
            } else if (this.detailPanelType === "Message Details") {
                this.setAddonDetailPanel("Message Details", this.detailPanelData);
            }
        }
    }

    @action
    reset() {
        this.showAddons = false;
        this.showAddonDetail = false;
        this.addonPanelType = null;
        this.addonPanelData = null;
        this.addonPanelTab = null;
        this.detailPanelType = null;
        this.detailPanelData = null;
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
    setAddonPanelTab(panelType, panelTab) {
        this.addonPanelTab = panelTab;

        switch (panelType) {
            case "files":
                this.rootStore.teamFilesStore.setUserFilter(
                    panelTab === "all" ? undefined : currentUser.id,
                    true
                );
                break;
            default:
        }
    }

    @action
    setAddonPanel(panelType, panelData, panelTab) {
        if (panelType || panelData) {
            this.addonPanelType = panelType;
            this.addonPanelData = panelData;
            this.addonPanelTab = panelTab;
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
                this.rootStore.filesStore.onCollapseChange();
                this.setAddonPanelTab(panelType, panelTab || "all");
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

        switch (panelType) {
            case "File Details":
                this.rootStore.messageStore.load(panelData);
                this.rootStore.teamFileStore.load(panelData.upload_id);
                break;
            case "Message Details":
                this.rootStore.messageStore.load(panelData);
                break;
            
            default:
        }
    }
}

export default AddonStore;