import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import { Emoji } from "emoji-mart";
import Remarkable from "remarkable";
// import ReactDOMServer from "react-dom/server";
// import ReactMarkdown from "react-markdown";
// import Markdown from "react-remarkable";
// import Linkify from "linkifyjs/react";
import moment from "moment";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import UserMention from "./user-mention";
import FileAttachment from "./file-attachment";
import LinkPreview from "./link-preview";
import Reactions from "./reactions";

@inject("usersStore", "messageStore")
class MessageContent extends Component {
  onToggle = emoji => {
    this.props.messageStore.toggleReaction(this.props.message.id, emoji);
  };

  // this isn't actually used D:
  // toMarkup(stringOrComponent) {
  //   if (typeof stringOrComponent === "string") {
  //     return stringOrComponent;
  //   }

  //   return ReactDOMServer.renderToString(stringOrComponent);
  // }

  nodeList() {
    const { message } = this.props;

    // HRM...
    // const newline = /?:^|<\/pre>)[^]*?(?:<pre>|$)/g;

    const newline = "\n";
    const lines = (message.text_content || "").split(newline);

    return lines.map(line => {
      return this.renderMessageLine(line);
    });
  }

  renderMessageLine(line) {
    const { usersStore, messageStore } = this.props;
    const { usersById } = usersStore;
    const parts = messageStore.decodeMessage(line);
    const isAllEmojis =
      parts.filter(p => p.type === "emoji").length === parts.length;

    return parts.map((part, i) => {
      if (part.type === "group_mention") {
        return (
          <span key={`group_mention_${i}`} className="group-mention">
            @{part.content}
          </span>
        );
      } else if (part.type === "mention") {
        return (
          <UserMention
            key={`usermention_${i}`}
            user={usersById[part.content]}
          />
        );
      } else if (part.type === "emoji") {
        return (
          <Emoji
            key={`emoji_${i}`}
            emoji={part.content}
            size={isAllEmojis ? 32 : 18}
          />
        );
      }

      return this.renderMarkdownNode(part.content);
    });
  }

  renderMarkdownNode(content) {
    const md = new Remarkable({ linkify: true });
    return <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />;
  }

  renderLinkPreviews() {
    const {
      message: { link_previews: linkPreviews, id, user_id: userId }
    } = this.props;

    // wat

    if (linkPreviews && linkPreviews.length) {
      return linkPreviews.map((link, index) => (
        <LinkPreview
          key={`message_${id}_link_${index}`}
          {...link}
          messageId={id}
          senderId={userId}
        />
      ));
    }

    return null;
  }

  renderEdited() {
    const { message } = this.props;
    const { edited, edited_at: editedAt } = message;

    if (!edited) {
      return null;
    }

    const editedTooltip = (
      <Tooltip id="edited-tooltip">{moment(editedAt).calendar()}</Tooltip>
    );

    return (
      <OverlayTrigger placement="top" overlay={editedTooltip}>
        <span className="message-icon icon-edited">
          <i className="fa fa-edit" />
        </span>
      </OverlayTrigger>
    );
  }

  render() {
    const { message } = this.props;

    return (
      <div
        properties={{ target: "_blank", className: "message-link" }}
        className="message-body-wrapper"
      >
        {message.type === "upload" && <FileAttachment {...message.fields} />}
        <div className="message-body">
          {message.type === "upload" && message.text_content ? (
            <div className="attachment-comment">{message.text_content}</div>
          ) : (
            this.nodeList()
          )}

          {this.renderLinkPreviews()}
          {this.renderEdited()}
          <Reactions
            messageId={message.id}
            reactions={message.reactions_web}
            onToggle={this.onToggle}
          />
        </div>
      </div>
    );
  }
}

MessageContent.propTypes = {
  message: PropTypes.any.isRequired
};

export default MessageContent;
