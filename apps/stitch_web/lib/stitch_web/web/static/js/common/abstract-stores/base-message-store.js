import moment from "moment";
import { observable, action, extendObservable } from "mobx";
import { animateScroll, scroller } from "react-scroll";

import flow from "lodash/flow";
import groupBy from "lodash/fp/groupBy";
import mapValues from "lodash/fp/mapValues";
import orderBy from "lodash/fp/orderBy";

import isFunction from "lodash/fp/isFunction";

import REGEX from "lib/regex";
import { SEQUENTIAL_SPLIT_SECONDS } from "lib/constants";
import TimeoutManager from "lib/TimeoutManager";

export function sortableDateFromMessage(message) {
  return moment
    .utc(message.inserted_at)
    .local()
    .format(`YYYY-MM-DD`);
}

export default class BaseMessageStore {
  @observable chatDiv = null; // Div element of chat pane
  @observable messages = []; // messages currently loaded
  @observable messageInEdit = null; // Message currently being edited
  @observable textInEdit = ""; // Current text of message in edit
  @observable mountedMessages = [];
  messageElements = {}; // Div elements of messages loaded in the chat div

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.timeoutManager = new TimeoutManager();
  }

  getMessageById = (id, enforceSent = false) => {
    const matchCondition = m =>
      m.id === id && (!enforceSent || this.isSentMessage(m));
    return this.messages.find(matchCondition);
  };

  @action
  updateMessageData = (messageId, groupId, messageAttributes) => {
    const message = this.getMessageById(messageId);
    let updatedAttributes;
    if (message) {
      if (isFunction(messageAttributes)) {
        updatedAttributes = messageAttributes(message);
      } else {
        updatedAttributes = messageAttributes;
      }
      extendObservable(message, updatedAttributes);
    }

    this.messageCache.updateCachedMessage(
      groupId,
      messageId,
      messageAttributes
    );
  };

  isCurrentChannelPayload() {
    console.warn(`isCurrentChannelPayload should be overriden`); // eslint-disable-line no-console
  }

  // ===========================
  // Scroll Actions
  // ===========================

  // Scroll to the bottom of chat div with animation
  scrollToBottom = (cb = null, duration = 0, delay = 100) => {
    this.timeoutManager.setTimeout(() => {
      animateScroll.scrollToBottom({
        containerId: "chat",
        duration
      });

      this.timeoutManager.setTimeout(() => {
        if (typeof cb === "function") {
          cb();
        }
      }, duration || 300);
    }, delay);
  };

  // Scroll to specific message in chat div instantly
  scrollTo(messageId, duration = 1000, cb, offset = -50) {
    scroller.scrollTo(`message_${messageId}`, {
      containerId: "chat",
      smooth: true,
      duration,
      offset
    });

    this.timeoutManager.setTimeout(() => {
      if (typeof cb === "function") {
        cb();
      }
    }, duration + 1);
  }

  keepScrollAtBottom = () => {
    if (this.isScrollBottom) {
      this.scrollToBottom();
    }
  };

  // ===========================
  // Message Edit Actions
  // ===========================

  @action
  startEdit(id) {
    const message = this.getMessageById(id);

    if (message) {
      this.messageInEdit = message;
      this.textInEdit = this.decodeMentions(message.text_content);
    }
  }

  @action
  editLastMessage() {
    const message = this.messages.find(m => m.user_id === currentUser.id);

    if (this.isSentMessage(message)) {
      this.startEdit(message.id);
    }
  }

  @action
  editText(text) {
    if (!this.messageInEdit) {
      return;
    }

    this.textInEdit = text;
  }

  @action
  cancelEdit() {
    this.messageInEdit = null;
    this.textInEdit = "";
  }

  /**
   * Registers chat div
   *
   * @param {DOMElement} div
   */
  loadChatDiv = div => {
    this.chatDiv = div;
  };

  /**
   * Unregisters chat div
   *
   */
  unloadChatDiv = () => {
    this.chatDiv = null;
  };

  // ===========================
  // Event Handlers
  // ===========================

  /**
   * Registers message div when message component is mounted
   *
   * @param {Integer} messageId
   * @param {DOMElement} messageDiv
   */
  @action
  onMessageMounted = (messageId, messageDiv) => {
    if (this.mountedMessages.indexOf(messageId) === -1) {
      this.mountedMessages.push(messageId);
    }

    this.messageElements[messageId] = { div: messageDiv };
  };

  @action
  onMessageUnmounted = messageId => {
    this.mountedMessages = this.mountedMessages.filter(id => id !== messageId);
  };

  @action
  onEditMessage = editedMessage => {
    if (this.isCurrentChannelPayload(editedMessage)) {
      this.cancelEdit();
    }

    this.updateMessageData(editedMessage.id, editedMessage.group_id, {
      edited: editedMessage.edited,
      edited_at: editedMessage.edited_at,
      text_content: editedMessage.text_content
    });
  };

  @action
  onDeleteMessage = deletedMessage => {
    const messageIndex = this.messages.findIndex(
      m => m.id === deletedMessage.id
    );

    if (messageIndex > -1) {
      this.messages.splice(messageIndex, 1);
    }
    this.messageCache.deleteMessage(deletedMessage.group_id, deletedMessage.id);
  };

  @action
  onLinkPreviewGenerated = payload => {
    if (payload.link_previews && payload.link_previews.length) {
      this.updateMessageData(payload.id, payload.group_id, {
        link_previews: payload.link_previews
      });

      if (this.isCurrentChannelPayload(payload)) {
        this.keepScrollAtBottom();
      }
    }
  };

  @action
  onLinkPreviewDeleted = payload => {
    const message = this.getMessageById(payload.message_id);

    if (message) {
      this.updateMessageData(payload.message_id, payload.group_id, {
        link_previews: message.link_previews.filter(
          p => p.link !== payload.link
        )
      });
      this.keepScrollAtBottom();
    }
  };

  @action
  onReactionUpdate = payload => {
    this.updateMessageData(payload.message_id, payload.group_id, {
      reactions_web: payload.reactions_web
    });
  };

  @action
  onReadStatusUpdate = payload => {
    if (!payload.messages) return;

    Object.keys(payload.messages).forEach(messageId => {
      const message = this.getMessageById(parseInt(messageId, 10));
      this.updateMessageData(
        parseInt(messageId, 10),
        payload.group_id,
        messageToUpdate => {
          return {
            read_status: Object.assign(
              {},
              messageToUpdate.read_status || {},
              payload.messages[messageId]
            )
          };
        }
      );

      if (!message) {
        // cache read status because this event was broadcasted before new_msg due to network slowness
        this.readStatusCache[messageId] = this.readStatusCache[messageId] || {};
        Object.assign(
          this.readStatusCache[messageId],
          payload.messages[messageId]
        );
      }
    });
  };

  // ===========================
  // Utilities
  // ===========================

  groupMessagesByDate(messagesToGroup, orderby = "asc") {
    return flow(
      orderBy("inserted_at", orderby),
      groupBy(sortableDateFromMessage),
      mapValues(msgGroup => {
        const [firstMsg, ...messages] = msgGroup;
        let sequentialStart = firstMsg;
        return [
          firstMsg,
          ...messages.map(m => {
            let { type } = m;
            if (m.upload_id && type === "chat") {
              type = "file_comment";
            }

            const msg = { ...m, type };
            const sameUser = msg.user.id === sequentialStart.user.id;

            if (
              (sequentialStart.upload_id === msg.upload_id &&
                msg.type === "file_comment") ||
              (sameUser &&
                sequentialStart.type !== "system" &&
                msg.type !== "upload" &&
                msg.type !== "file_comment" &&
                moment(msg.inserted_at).diff(
                  moment(sequentialStart.inserted_at),
                  "seconds"
                ) < SEQUENTIAL_SPLIT_SECONDS)
            ) {
              return { ...msg, is_sequential: true };
            }

            sequentialStart = msg;
            return msg;
          })
        ];
      })
    )(messagesToGroup);
  }

  /**
   * Encodes message for backend compatible format
   * - @emil -> <@U123>
   * @param {string} messageText
   * @returns {string} encoded message
   */
  encodeMessage = (messageText = "") => {
    const { usersByUsername } = this.rootStore.usersStore;
    return messageText.replace(
      REGEX.getUserMentionEncode(),
      (match, username) => {
        const user = usersByUsername[username];
        if (["everyone", "room", "here"].indexOf(username) > -1) {
          return `<@G${username}>`;
        } else if (user) {
          return `<@U${user.id}>`;
        }

        return match;
      }
    );
  };

  decodeMentions = (text = "") => {
    const { usersById } = this.rootStore.usersStore;
    const messageToFilter = text.split(" ");

    const filteredMessage = messageToFilter.map(part => {
      // Replace userMentionId with UserMention
      const match = part.match(REGEX.getUserMentionDecode());
      if (match) {
        return part.replace(
          REGEX.getUserMentionDecode(),
          `@${usersById[match[1]].username}`
        );
      }

      // Replace groupMentionId with GroupMention
      const groupMatch = part.match(REGEX.getGroupMentionDecode());
      if (groupMatch) {
        return part.replace(
          REGEX.getGroupMentionDecode(),
          `@${[groupMatch[1]]}`
        );
      }

      return part;
    });

    return filteredMessage.join(" ");
  };

  isSentMessage(message) {
    return (
      message && message.status !== "sending" && message.status !== "failure"
    );
  }
}
