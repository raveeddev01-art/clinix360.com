/**
 * Conversation store
 *
 * This is a mobx store that keeps track of data related to current conversation on engage
 */

import { observable, computed, action } from "mobx";
import BaseMessageStore from "common/abstract-stores/base-message-store";

class ConversationMessageStore extends BaseMessageStore {
  // ===========================
  // Getters
  // ===========================

  get conversation() {
    const { inboxStore } = this.rootStore;
    return inboxStore.currentConversation;
  }

  @computed
  get messagesByDate() {
    return this.groupMessagesByDate(this.messages);
  }

  // ===========================
  // Actions
  // ===========================

  sendMessage = () => {};

  // ===========================
  // Methods
  // ===========================

  reset() {
    this.messages = [];
    this.messageInEdit = null;
  }

  // ===========================
  // Event Handlers
  // ===========================

  @action
  onConversationLoaded = conversation => {
    this.messages = conversation.conversation_messages;
  };
}

export default ConversationMessageStore;
