import moment from "moment";

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
  constructor(rootStore) {
    this.rootStore = rootStore;
  }

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

            if (
              (sequentialStart.upload_id === msg.upload_id &&
                msg.type === "file_comment") ||
              (msg.user.id === sequentialStart.user.id &&
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
