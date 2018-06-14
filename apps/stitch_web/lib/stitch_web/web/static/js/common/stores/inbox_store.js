/**
 * Inbox store
 *
 * This is a mobx store that keeps track of data related to inbox menu and global state.
 */

import { observable, action } from "mobx";

class InboxStore {
  @observable currentModal = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  // //////////
  // METHODS //
  // /////// //

  @action
  setModal = modalName => {
    this.currentModal = modalName;
  };

  @action
  closeModal = () => {
    this.currentModal = null;
  };
}

export default InboxStore;
