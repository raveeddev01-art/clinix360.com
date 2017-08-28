import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import UserMention from "./user-mention";
import FileAttachment from "./file-attachment";

@inject("sidemenuStore")
@observer
class MessageText extends Component {
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
        {this.renderMessageText()}
      </div>
    );
  }
}

export default MessageText;
