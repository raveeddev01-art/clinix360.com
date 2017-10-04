import React, { Component, PropTypes } from "react";
import { observer, inject } from "mobx-react";
import { Emoji } from "emoji-mart";
import { getData as getEmoji } from "emoji-mart/dist/utils";
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
        const COLON_REGEX = /(?::[^:]+:)(?::skin-tone-\d:)?/g;
        const emojis = word.match(COLON_REGEX);
        const texts = word.split(COLON_REGEX);
        const result = [];
        const size =
          words.length === 1 && !texts.filter(t => t).length ? 32 : 16;

        texts.forEach((text, index) => {
          if (index >= 1) {
            const hasEmoji = !!getEmoji(emojis[index - 1]).name;
            if (hasEmoji) {
              result.push(
                <Emoji
                  key={`emoji_${message.id}_${i}_${index}`}
                  emoji={emojis[index - 1]}
                  size={size}
                />
              );
            } else {
              result.push(emojis[index - 1]);
            }
          }

          if (text) {
            result.push(text);
          }
        });

        return prev.concat(result);
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
