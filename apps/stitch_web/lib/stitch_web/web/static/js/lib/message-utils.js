import moment from "moment";

import flow from "lodash/flow";
import groupBy from "lodash/fp/groupBy";
import mapValues from "lodash/fp/mapValues";
import sortBy from "lodash/fp/sortBy";

import { SEQUENTIAL_SPLIT_SECONDS } from "lib/constants";

export function sortableDateFromMessage(message) {
  return moment
    .utc(message.inserted_at)
    .local()
    .format(`YYYY-MM-DD`);
}

export function isSentMessage(message) {
  return (
    message && message.status !== "sending" && message.status !== "failure"
  );
}

export function groupMessagesByDate(allMessages) {
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
  )(allMessages);
}
