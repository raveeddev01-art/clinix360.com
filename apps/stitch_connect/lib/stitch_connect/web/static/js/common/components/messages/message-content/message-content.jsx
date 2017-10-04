import React, { Component, PropTypes } from "react";
import { observer, inject } from "mobx-react";
import { Emoji } from "emoji-mart";
import UserMention from "./user-mention";
import FileAttachment from "./file-attachment";

@inject("sidemenuStore")
@observer
class MessageContent extends Component {
  renderMessageText = () => {
    const { message, sidemenuStore } = this.props;
    const { usernameMap } = sidemenuStore;
    const words = (message.text_content || "").split(" ");

    return words.reduce((prev, word, i) => {
      if (word.indexOf("@") === 0) {
        const username = word.substr(1);
        if (usernameMap[username]) {
          return prev.concat(
            <UserMention
              key={`usermention_${i}`}
              user={usernameMap[username]}
            />
          );
        }
      } else if (word.indexOf(":") === 0) {
        const match = word.match(/:.+:/);
        const emoji = match[0];
        const remainder = word.substr(emoji.length);
        const size = words.length === 1 && !remainder ? 32 : 16;
        const result = prev.concat(
          <Emoji key={`emoji_${message.id}_${i}`} emoji={emoji} size={size} />
        );

        if (remainder) {
          return result.concat(remainder);
        }

        return result;
      }

      if (typeof prev[prev.length - 1] === "string") {
        prev[prev.length - 1] += ` ${word}`;
        return prev;
      }

      return prev.concat(word);
    }, []);
  };

  render() {
    const { message } = this.props;
    return (
      <div>
        {message.type === "upload" && <FileAttachment {...message.fields} />}
        <div className="message-body">
          {message.type === "upload" && message.text_content && '"'}
          {this.renderMessageText()}
          {message.type === "upload" && message.text_content && '"'}
        </div>
      </div>
    );
  }
}

MessageContent.propTypes = {
  message: PropTypes.any.isRequired
};

export default MessageContent;
