/**
 * Inbox store
 *
 * This is a mobx store that keeps track of data related to inbox menu and global state.
 */

import { observable, computed, action } from "mobx";

class InboxStore {
  @observable defaultInbox = {};
  @observable conversations = [];
  @observable currentModal = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  // //////// //
  // COMPUTED //
  // //////// //

  @computed
  get openedConversations() {
    return this.conversations
      .filter(conversations => conversations.open)
      .sort((conversation1, conversation2) => {
        // Sort conversations by latest updated
        if (conversation1.updated_at < conversation2.updated_at) return 1;
        if (conversation1.updated_at > conversation2.updated_at) return -1;
        return 0;
      });
  }

  @computed
  get closedConversations() {
    return this.conversations
      .filter(conversations => !conversations.open)
      .sort((conversation1, conversation2) => {
        // Sort conversations by latest updated
        if (conversation1.updated_at < conversation2.updated_at) return 1;
        if (conversation1.updated_at > conversation2.updated_at) return -1;
        return 0;
      });
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

  // Loading only default inbox for now
  @action
  loadInboxes = () => {
    return get("/api/v1/inboxes/default").then(response => {
      this.defaultInbox = response.data;
    });
  };

  @action
  loadConversations = id => {
    return get(`/api/v1/inboxes/${id}/conversations`).then(response => {
      this.conversations = response.data;
    });
  };

  @action
  createConversation = params => {
    return post(`/api/v1/inboxes/1/conversations`, {
      body: params
    }).then(response => {
      this.conversations.push(response.data);
    });
  };
}

export default InboxStore;
