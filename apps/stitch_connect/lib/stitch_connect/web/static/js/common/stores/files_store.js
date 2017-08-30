import { observable, action } from "mobx";

class FilesStore {
  @observable files = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }
}

export default FilesStore;
