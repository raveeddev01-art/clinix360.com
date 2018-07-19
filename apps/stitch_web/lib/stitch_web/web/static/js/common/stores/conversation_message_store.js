/**
 * Conversation store
 *
 * This is a mobx store that keeps track of data related to current conversation on engage
 */

import { observable, computed, action } from "mobx";
import { groupMessagesByDate } from "lib/message-utils";

class ConversationMessageStore {
  @observable messages = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  // ===========================
  // Getters
  // ===========================

  get conversation() {
    const { inboxStore } = this.rootStore;
    return inboxStore.currentConversation;
  }

  @computed
  get messagesByDate() {
    return groupMessagesByDate(this.messages);
  }

  // ===========================
  // Actions
  // ===========================

  sendMessage = () => {};

  // ===========================
  // Event Handlers
  // ===========================

  @action
  onConversationLoaded = conversation => {
    this.messages = conversation.conversation_messages;
  };
}

export default ConversationMessageStore;
