import moment from "moment";
import { observable, action, extendObservable } from "mobx";

import flow from "lodash/flow";
import groupBy from "lodash/fp/groupBy";
import mapValues from "lodash/fp/mapValues";
import sortBy from "lodash/fp/sortBy";

import REGEX from "lib/regex";
import { SEQUENTIAL_SPLIT_SECONDS } from "lib/constants";

export function sortableDateFromMessage(message) {
  return moment
    .utc(message.inserted_at)
    .local()
    .format(`YYYY-MM-DD`);
}

export default class BaseMessageStore {
  @observable messages = []; // messages currently loaded
  @observable messageInEdit = null; // Message currently being edited
  @observable textInEdit = ""; // Current text of message in edit

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  getMessageById = (id, enforceSent = false) => {
    const matchCondition = m =>
      m.id === id && (!enforceSent || this.isSentMessage(m));
    return this.messages.find(matchCondition);
  };

  @action
  updateMessageData = (id, data) => {
    const message = this.getMessageById(id);
    if (message) {
      extendObservable(message, data);
    }
  };

  isCurrentChannelPayload() {
    console.warn(`isCurrentChannelPayload should be overriden`); // eslint-disable-line no-console
  }

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

  // ===========================
  // Event Handlers
  // ===========================

  @action
  onEditMessage = editedMessage => {
    if (!this.isCurrentChannelPayload(editedMessage)) {
      return;
    }

    this.cancelEdit();

    this.updateMessageData(editedMessage.id, {
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
  };

  @action
  onLinkPreviewGenerated = payload => {
    if (!this.isCurrentChannelPayload(payload)) {
      return;
    }

    if (payload.link_previews && payload.link_previews.length) {
      this.updateMessageData(payload.id, {
        link_previews: payload.link_previews
      });
      this.keepScrollAtBottom();
    }
  };

  @action
  onLinkPreviewDeleted = payload => {
    const message = this.getMessageById(payload.message_id);

    if (message) {
      this.updateMessageData(payload.message_id, {
        link_previews: message.link_previews.filter(
          p => p.link !== payload.link
        )
      });
      this.keepScrollAtBottom();
    }
  };

  @action
  onReactionUpdate = payload => {
    this.updateMessageData(payload.message_id, {
      reactions_web: payload.reactions_web
    });
  };

  @action
  onReadStatusUpdate = payload => {
    if (!payload.messages) return;

    Object.keys(payload.messages).forEach(message_id => {
      const message = this.getMessageById(parseInt(message_id, 10));
      if (message) {
        this.updateMessageData(parseInt(message_id, 10), {
          read_status: Object.assign(
            {},
            message.read_status || {},
            payload.messages[message_id]
          )
        });
      } else {
        // cache read status because this event was broadcasted before new_msg due to network slowness
        this.readStatusCache[message_id] =
          this.readStatusCache[message_id] || {};
        Object.assign(
          this.readStatusCache[message_id],
          payload.messages[message_id]
        );
      }
    });
  };

  // ===========================
  // Utilities
  // ===========================

  groupMessagesByDate(messagesToGroup) {
    return flow(
      sortBy("inserted_at"),
      groupBy(sortableDateFromMessage),
      mapValues(msgGroup => {
        const [firstMsg, ...messages] = msgGroup;
        let sequentialStart = firstMsg;
        return [
          firstMsg,
          ...messages.map(msg => {
            if (msg.upload_id && msg.type === "chat") {
              msg.type = "file_comment";
            }

            const sameUser =
              (msg.user && msg.user.id === sequentialStart.user.id) ||
              msg.provider_id === sequentialStart.provider_id ||
              msg.patient_id === sequentialStart.provider_id;

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
