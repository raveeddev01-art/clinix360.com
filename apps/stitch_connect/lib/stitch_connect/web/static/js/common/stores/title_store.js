import { observable, computed, action } from "mobx";

class TitleStore {
  @observable pageName = "";

  constructor(rootStore, props) {
    this.rootStore = rootStore;
    this.teamName = props.teamName;
  }

  @computed
  get title() {
    const parts = [this.pageName, this.teamName, "Stitch"];
    return parts.filter(p => p).join(" | ");
  }

  @action
  setPageName(pageName) {
    this.pageName = pageName;
  }
}

export default TitleStore;
