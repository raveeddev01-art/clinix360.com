/**
 * Conversation store
 *
 * This is a mobx store that keeps track of data related to current conversation on engage
 */

import { observable, computed, action } from "mobx";
import BaseMessageStore from "common/abstract-stores/base-message-store";

class ConversationMessageStore extends BaseMessageStore {
  @observable isScrollBottom = false; // TRUE if reached to the bottom scroll of chat div, otherwise FALSE

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

    return post(`/api/v1/conversations/${this.conversation.id}/messages`, {
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

    const trimmedEditText = this.textInEdit.trim();

    if (
      !trimmedEditText ||
      this.messageInEdit.text_content === trimmedEditText
    ) {
      this.cancelEdit();
      return;
    }

    this.conversationChannel.push("edited_conversation_message", {
      message_id: this.messageInEdit.id,
      params: {
        text_content: this.encodeMessage(trimmedEditText)
      }
    });
  }

  @action
  deleteLinkPreview = (messageId, link) => {
    return put(
      `/api/v1/conversation_messages/${this.conversation
        .id}/delete_link_preview`,
      {
        body: {
          id: messageId,
          link
        }
      }
    );
  };

  @action
  toggleReaction = (messageId, emoji) => {
    return put(
      `/api/v1/conversation_messages/${this.conversation.id}/toggle_reaction`,
      {
        body: {
          message_id: messageId,
          emoji_name: emoji
        }
      }
    );
  };

  // ===========================
  // Methods
  // ===========================

  reset() {
    this.messages = [];
    this.mountedMessages = [];
    this.messageInEdit = null;
    this.isScrollBottom = true;
  }

  isCurrentChannelPayload(payload) {
    return payload.conversation_id === this.conversation.id;
  }

  // ===========================
  // Event Handlers
  // ===========================

  @action
  onScrollTopReached() {}

  @action
  onScrollBottomReached() {
    this.isScrollBottom = true;
  }

  @action
  onScrollBottomLeft() {
    this.isScrollBottom = false;
  }

  @action
  onConversationLoaded = conversation => {
    this.messages = conversation.conversation_messages;
    this.scrollToBottom();
  };

  // @TODO manage granular control over scrolling when receiving message from other users
  @action
  onNewMessage = newMessage => {
    this.messages.unshift(newMessage);
    this.scrollToBottom();
  };
}

export default ConversationMessageStore;
