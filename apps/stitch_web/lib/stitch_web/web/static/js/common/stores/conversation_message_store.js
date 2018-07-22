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

  get conversationChannel() {
    const { channelStore } = this.rootStore;

    return channelStore.conversationChannel;
  }

  // ===========================
  // Actions
  // ===========================

  sendMessage = (text, additionalFields = {}) => {
    // @TODO handle optimistic UI
    const messageText = this.encodeMessage(text);
    const newMsg = {
      text_content: messageText,
      ...additionalFields
    };

    post(`/api/v1/conversations/${this.conversation.id}/messages`, {
      body: {
        message: newMsg,
        authenticated_urls: true
      }
    });
  };

  @action
  finishEdit() {
    if (!this.messageInEdit) {
      return;
    }

    this.startTyping.flush(); // flushing throttle

    const trimmedEditText = this.textInEdit.trim();

    if (
      !trimmedEditText ||
      this.messageInEdit.text_content === trimmedEditText
    ) {
      this.cancelEdit();
      return;
    }

    // FIXME confirm below event name
    this.conversationChannel.push("edit_conversation_message", {
      message_id: this.messageInEdit.id,
      params: {
        text_content: this.encodeMessage(trimmedEditText)
      }
    });
  }

  // ===========================
  // Methods
  // ===========================

  reset() {
    this.messages = [];
    this.messageInEdit = null;
  }

  isCurrentChannelPayload(payload) {
    return payload.conversation_id === this.conversation.id;
  }

  // ===========================
  // Event Handlers
  // ===========================

  @action
  onConversationLoaded = conversation => {
    this.messages = conversation.conversation_messages;
  };

  @action
  onNewMessage = newMessage => {
    this.messages.unshift(newMessage);
  };
}

export default ConversationMessageStore;
