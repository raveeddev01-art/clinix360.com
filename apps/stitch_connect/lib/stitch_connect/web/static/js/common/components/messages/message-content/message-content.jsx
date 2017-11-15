import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { Emoji } from "emoji-mart";
import { getData as getEmoji } from "emoji-mart/dist/utils";
import Linkify from "react-linkify";

import UserMention from "./user-mention";
import FileAttachment from "./file-attachment";
import LinkPreview from "./link-preview";

@inject("sidemenuStore")
@observer
class MessageContent extends Component {
  renderMessageLine(line) {
    const { sidemenuStore } = this.props;
    const { usersByUsername } = sidemenuStore;
    const words = line.split(" ");

    return words.reduce((prev, word, i) => {
      if (word.indexOf("@") === 0) {
        const username = word.substr(1);
        if (usersByUsername[username]) {
          return prev.concat(
            <UserMention
              key={`usermention_${i}`}
              user={usersByUsername[username]}
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
                  key={`emoji_${i}_${index}`}
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
  }

  renderMessageText() {
    const { message } = this.props;
    const newline = "\n";
    const lines = (message.text_content || "").split(newline);

    return lines.reduce(
      (result, line, i) =>
        result.concat(this.renderMessageLine(line), <br key={`br_${i}`} />),
      []
    );
  }

  renderLinkPreviews() {
    const {
      message: { link_previews: linkPreviews, id, user_id: userId }
    } = this.props;

    if (linkPreviews && linkPreviews.length) {
      return linkPreviews.map((link, index) => (
        <LinkPreview
          key={`msg_${id}_link_${index}`}
          {...link}
          msgId={id}
          senderId={userId}
        />
      ));
    }

    return null;
  }

  render() {
    const { message } = this.props;

    return (
      <Linkify
        properties={{ target: "_blank", className: "message-link" }}
        className="message-body-wrapper"
      >
        {message.type === "upload" && <FileAttachment {...message.fields} />}
        <div className="message-body">
          {message.type === "upload" && message.text_content && '"'}
          {this.renderMessageText()}
          {message.type === "upload" && message.text_content && '"'}
          {this.renderLinkPreviews()}
        </div>
      </Linkify>
    );
  }
}

MessageContent.propTypes = {
  message: PropTypes.any.isRequired
};

export default MessageContent;
