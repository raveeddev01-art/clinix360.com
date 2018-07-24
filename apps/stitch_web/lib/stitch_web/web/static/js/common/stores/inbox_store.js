/**
 * Inbox store
 *
 * This is a mobx store that keeps track of data related to inbox menu and global state.
 */

import { observable, computed, action } from "mobx";
import { stringify } from "qs";
import unionBy from "lodash/unionBy";
import moment from "moment";

class InboxStore {
  @observable conversations = [];
  @observable currentInbox = {};
  @observable currentInboxFilter = null; // ["open", "closed", null]
  @observable currentModal = null;
  @observable messagesLoaded = false;
  @observable conversationsLoaded = false;
  @observable isLoadingConversationPage = false;
  @observable currentConversationId = null;
  @observable messagesLoaded = false;
  @observable engageLoaded = false;
  @observable currentModal = null;

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

  get apiBasePath() {
    return `${this.rootStore.apiBasePath}/inboxes`;
  }

  getConversationById = id =>
    this.conversations.find(conversation => conversation.id === id);

  // ===========
  //   COMPUTED
  // ===========

  get lastConversation() {
    return this.conversations[0];
  }

  @computed
  get sortedConversations() {
    return this.conversations.sort(this.sortByUpdated);
  }
  @computed
  get currentConversation() {
    return this.getConversationById(this.currentConversationId);
  }

  @computed
  get openedConversations() {
    return this.conversations.filter(conversations => conversations.open);
  }

  @computed
  get closedConversations() {
    return this.conversations.filter(conversations => !conversations.open);
  }

  @computed
  get currentInboxId() {
    return this.currentInbox.id;
  }

  @computed
  get fullyLoadedForCurrentFilter() {
    return this.conversationsForFilter.length >= this.totalForFilter;
  }

  @computed
  get conversationsForFilter() {
    if (!this.currentInboxFilter) {
      return this.conversations;
    }

    return this.currentInboxFilter === "open"
      ? this.openedConversations
      : this.closedConversations;
  }

  @computed
  get totalForFilter() {
    if (!this.currentInboxFilter) {
      return this.currentInbox.conversations_count;
    }

    return this.currentInboxFilter === "open"
      ? this.currentInbox.open_conversations_count
      : this.currentInbox.closed_conversations_count;
  }

  // ===========
  //   ACTIONS
  // ===========

  @action
  setCurrentInboxFilter = filter => {
    this.currentInboxFilter = filter;
  };

  @action
  setModal = modalName => {
    this.currentModal = modalName;
  };

  @action
  closeModal = () => {
    this.currentModal = null;
  };

  @action
  updateConversationData = (id, data) => {
    const conversation = this.getConversationById(id);

    if (conversation) {
      Object.assign(conversation, data);
    }
  };

  @action
  closeConversation = id => {
    return put(`/api/v1/conversations/${id}/close`);
  };

  @action
  reopenConversation = id => {
    return put(`/api/v1/conversations/${id}/open`);
  };

  @action
  addConversations = newConversations => {
    this.conversations = unionBy(
      newConversations,
      this.conversations,
      c => c.id
    );
  };

  @action
  loadEngage = async () => {
    try {
      await this.loadInbox();
      await this.loadConversations(this.currentInbox.id);
      this.engageLoaded = true;
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
    return get(`${this.apiBasePath}/default`).then(response => {
      this.rootStore.channelStore.joinInboxChannel(response.data.id);
      this.currentInbox = response.data;
    });
  };

  @action
  loadConversations = id => {
    return get(`${this.apiBasePath}/${id}/conversations`).then(response => {
      this.conversations = response.data.sort(this.sortByUpdated);
      this.conversationsLoaded = true;
    });
  };

  loadNextConversationPage = () => {
    const id = this.currentInbox.id;
    const lastConvo = this.sortedConversations[
      this.sortedConversations.length - 1
    ];

    if (lastConvo) {
      const updatedBefore = moment(lastConvo.updated_at).unix();
      let openParam;
      if (this.currentInboxFilter) {
        openParam = this.currentInboxFilter === "open";
      }

      const params = stringify({
        updated_before: updatedBefore,
        open: openParam
      });

      this.isLoadingConversationPage = true;

      get(`${this.apiBasePath}/${id}/conversations?${params}`)
        .then(response => {
          this.addConversations(response.data);
          this.isLoadingConversationPage = false;
        })
        .catch(() => {
          this.isLoadingConversationPage = false;
        });
    }
  };

  // Called from the conversations panel component
  @action
  openConversation = id => {
    this.messagesLoaded = false;
    this.loadConversation(id);
  };

  @action
  loadConversation = id => {
    const { conversationMessageStore, channelStore } = this.rootStore;
    this.currentConversationId = parseInt(id, 10);
    return get(
      `${this.rootStore.apiBasePath}/conversations/${id}`
    ).then(response => {
      conversationMessageStore.onConversationLoaded(response.data);
      this.messagesLoaded = true;

      channelStore
        .joinConversationChannel({ authenticated_urls: true })
        .receive("error", err => notify.show(err.message, "error"));
    });
  };

  @action
  createConversation = params => {
    return post(`${this.apiBasePath}/${this.currentInboxId}/conversations`, {
      body: params
    }).then(response => {
      this.changeCountsAsNeeded(response.data);
      this.addConversations([response.data]);
      return response.data.id;
    });
  };

  // ===================
  //   HANDLING EVENTS
  // ===================

  @action
  onConversationCreateEvent = ({ conversation }) => {
    this.changeCountsAsNeeded(conversation);
    this.addConversations([conversation]);
  };

  @action
  onConversationUpdateEvent = ({ conversation }) => {
    this.changeCountsAsNeeded(conversation);
    this.addConversations([conversation]);
  };

  // ===================
  //   CHANGING COUNTS
  // ===================

  @action
  changeCountsAsNeeded(conversation) {
    const oldVersion = this.conversations.find(c => c.id === conversation.id);

    // Just increment the necessary counts
    // Decrementing not needed
    if (!oldVersion) {
      this.incTotalCount();

      if (conversation.open) {
        this.incOpenCount();
      } else {
        this.incClosedCount();
      }

      return;
    }

    // Do nothing
    if (oldVersion.open === conversation.open) {
      return;
    }

    // Increment and decrement counts
    // as old and new open values differ
    if (conversation.open) {
      this.incOpenCount();
      this.decClosedCount();
    } else {
      this.decOpenCount();
      this.incClosedCount();
    }
  }

  @action
  incTotalCount = () => {
    this.incCount("conversations_count");
  };

  @action
  incOpenCount = () => {
    this.incCount("open_conversations_count");
  };

  @action
  incClosedCount = () => {
    this.incCount("closed_conversations_count");
  };

  @action
  decOpenCount = () => {
    this.decCount("open_conversations_count");
  };

  @action
  decClosedCount = () => {
    this.decCount("closed_conversations_count");
  };

  @action
  incCount = type => {
    if (!isNaN(this.currentInbox[type])) {
      this.currentInbox[type] = this.currentInbox[type] + 1;
    }
  };

  @action
  decCount = type => {
    if (!isNaN(this.currentInbox[type])) {
      this.currentInbox[type] = this.currentInbox[type] - 1;
    }
  };
  // ============================
  // Event Handlers
  // ============================

  @action
  onConversationCreated = conversation => {
    if (!this.getConversationById(conversation.id)) {
      this.conversations.push(conversation);
    }
  };

  @action
  onConversationUpdated = conversation => {
    this.updateConversationData(conversation.id, conversation);
  };
}

export default InboxStore;
