import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
// import { Emoji } from "emoji-mart";
import Remarkable from "remarkable";
import ReactDOMServer from "react-dom/server";
import moment from "moment";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
// import UserMention from "./user-mention";
import FileAttachment from "./file-attachment";
import LinkPreview from "./link-preview";
import Reactions from "./reactions";
// import formatMessageText from "../../../../util/format_message_text";
import messageTextToComponents from "../../../../chat/message-list/message-text-to-components";

@inject("usersStore", "messageStore", "addonStore", "groupsStore")
@observer
class MessageContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renders: []
    };
  }

  onToggle = emoji => {
    this.props.messageStore.toggleReaction(this.props.message.id, emoji);
  };

  toRenderableString(stringOrComponent) {
    if (typeof stringOrComponent === "string") {
      return stringOrComponent;
    }

    return ReactDOMServer.renderToString(stringOrComponent);
  }

  // messageAsHTML = () => {
  // const { message, usersStore, messageStore } = this.props;
  // const { usersById } = usersStore;
  // const parts = messageStore.decodeMessage(message.text_content || "");
  // const isAllEmojis =
  //   parts.filter(p => p.type === "emoji").length === parts.length;
  // return parts
  //   .map((part, i) => {
  //     let componentOrStringForType;
  //     if (part.type === "group_mention") {
  //       componentOrStringForType = (
  //         <span key={`group_mention_${i}`} className="group-mention">
  //           @{part.content}
  //         </span>
  //       );
  //     } else if (part.type === "mention") {
  //       componentOrStringForType = (
  //         <UserMention
  //           key={`usermention_${i}`}
  //           user={usersById[part.content]}
  //           addonStore={this.props.addonStore}
  //           groupsStore={this.props.groupsStore}
  //         />
  //       );
  //     } else if (part.type === "emoji") {
  //       componentOrStringForType = (
  // <Emoji
  //   key={`emoji_${i}`}
  //   emoji={part.content}
  //   size={isAllEmojis ? 32 : 18}
  // />
  //       );
  //     } else {
  //       componentOrStringForType = part.content;
  //     }
  //     return this.toRenderableString(componentOrStringForType);
  //   })
  //   .join("");
  // };

  formattedMessage() {
    return messageTextToComponents(this.props.message.text_content || "");
  }

  renderMarkdownNode(content) {
    const md = new Remarkable({ linkify: true, breaks: true });
    return md
      .render(content)
      .replace("<p>", "")
      .replace("</p>", "");
  }

  renderLinkPreviews() {
    const {
      message: { link_previews: linkPreviews, id, user_id: userId }
    } = this.props;

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
            this.formattedMessage()
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
