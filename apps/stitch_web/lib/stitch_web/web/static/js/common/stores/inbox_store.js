/**
 * Inbox store
 *
 * This is a mobx store that keeps track of data related to inbox menu and global state.
 */

import { observable, computed, action } from "mobx";

class InboxStore {
  @observable conversations = [];
  @observable currentInbox = {};
  @observable currentConversation = {};
  @observable currentModal = null;
  @observable messagesLoaded = false;
  @observable conversationsLoaded = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  sortByUpdated(conversation1, conversation2) {
    if (conversation1.updated_at < conversation2.updated_at) return 1;
    if (conversation1.updated_at > conversation2.updated_at) return -1;
    return 0;
  }

  // ===========
  //   GETTERS
  // ===========

  get closedConversationsCount() {
    return this.currentInbox.closed_conversations_count;
  }

  getConversationById = id =>
    this.conversations.find(conversation => conversation.id === id);

  // ===========
  //   COMPUTED
  // ===========

  @computed
  get sortedConversations() {
    return this.conversations.sort(this.sortByUpdated);
  }

  @computed
  get openedConversations() {
    return this.conversations
      .filter(conversations => conversations.open)
      .sort(this.sortByUpdated);
  }

  @computed
  get closedConversations() {
    return this.conversations
      .filter(conversations => !conversations.open)
      .sort(this.sortByUpdated);
  }

  // ===========
  //   ACTIONS
  // ===========

  @action
  setModal = modalName => {
    this.currentModal = modalName;
  };

  @action
  closeModal = () => {
    this.currentModal = null;
  };

  @action
  closeConversation = id => {
    return put(`/api/v1/conversations/${id}/close`);
  };

  @action
  openConversation = id => {
    return put(`/api/v1/conversations/${id}/open`);
  };

  @action
  loadEngageAsPatient = async onLoaded => {
    try {
      await this.loadInboxAsPatient();
      await this.loadConversationsAsPatient(this.currentInbox.id);
    } catch (e) {
      // TODO if error occurs here, redirect to error page
      console.error(e); // eslint-disable-line
    }

    if (onLoaded) {
      onLoaded();
    }
  };

  @action
  loadEngage = async () => {
    try {
      await this.loadInbox();
      await this.loadConversations(this.currentInbox.id);
    } catch (e) {
      // TODO if error occurs here, redirect to error page
      console.error(e); // eslint-disable-line
    }

    // Hide the HTML loading elements.
    $(".html-loading-element").remove();
  };

  // Loading only default inbox for now
  @action
  loadInbox = () => {
    return get("/api/v1/inboxes/default").then(response => {
      this.currentInbox = response.data;
    });
  };

  @action
  loadInboxAsPatient = () => {
    return get("/api/v1/patient/inboxes/default").then(response => {
      this.currentInbox = response.data;
    });
  };

  @action
  loadConversations = id => {
    return get(`/api/v1/inboxes/${id}/conversations`).then(response => {
      this.conversations = response.data;
      this.conversationsLoaded = true;
    });
  };

  @action
  loadConversationsAsPatient = id => {
    return get(`/api/v1/patient/inboxes/${id}/conversations`).then(response => {
      this.conversations = response.data;
      this.conversationsLoaded = true;
    });
  };

  // Called from the conversations panel component
  @action
  openConversation = id => {
    this.messagesLoaded = false;
    this.loadConversation(id);
  };

  @action
  loadConversation = id => {
    return get(`/api/v1/conversations/${id}`).then(response => {
      this.currentConversation = response.data;
      this.messagesLoaded = true;
    });
  };

  @action
  loadConversationAsPatient = id => {
    return get(`/api/v1/patient/conversations/${id}`).then(response => {
      this.currentConversation = response.data;
      this.messagesLoaded = true;
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

  @action
  createConversationAsPatient = params => {
    return post(`/api/v1/patient/inboxes/1/conversations`, {
      body: params
    }).then(response => {
      this.conversations.push(response.data);
    });
  };
}

export default InboxStore;
