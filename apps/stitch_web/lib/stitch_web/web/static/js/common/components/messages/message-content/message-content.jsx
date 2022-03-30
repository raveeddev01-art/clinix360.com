import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import moment from "moment";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import FileAttachment from "./file-attachment";
import LinkPreview from "./link-preview";
import Reactions from "./reactions";
import Replies from "./replies";
import CallMessage from "./call-message";
import MeetLinkMessage from "./meet-link-message";
import messageTextToComponents from "../../../../chat/message-list/message-text-to-components";

@inject("usersStore", "addonStore")
@observer
class MessageContent extends Component {
  onToggle = emoji => {
    const { message } = this.props;
    this.props.messageStore.toggleReaction(message.id, emoji, message.group_id);
  };

  onCommentsClick = () => {
    const { addonStore, message } = this.props;

    addonStore.setAddonPanel("files");
    addonStore.toggleAddons(true);
    addonStore.toggleAddonDetail(true);
    addonStore.setAddonDetailPanel("File Details", message);
  };

  renderLinkPreviews() {
    const {
      message: { link_previews: linkPreviews, id },
      user,
      messageStore
    } = this.props;

    if (linkPreviews && linkPreviews.length) {
      return linkPreviews.map((link, index) => (
        <LinkPreview
          key={`message_${id}_link_${index}`}
          {...link}
          deleteLinkPreview={messageStore.deleteLinkPreview}
          messageId={id}
          senderId={user.id}
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

  renderIntegrationLink = () => {
    const message = this.props.message;
    if (message.fields && message.fields.integration) {
      const i = message.fields.integration;
      const link = `https://drchrono.com/${i.data.type}/${i.data.id}`;
      return (
        <a target="_blank" href={link}>
          Link to drchrono
        </a>
      );
    }

    return null;
  };

  renderFileLink = () => {
    const { message, isConversationMessage } = this.props;
    return (
      <div>
        <span className="text-muted">commented on </span>
        <a onClick={isConversationMessage ? null : this.onCommentsClick}>
          <strong>{message.fields && message.fields.filename}</strong>
        </a>
      </div>
    );
  };

  render() {
    const { inSearch, message, user, isConversationMessage, addonStore } = this.props;
    const messageId = !message.id ? addonStore.detailPanelData.id : message.id;
    let messageContentComponents;

    if (message.type === "call") {
      messageContentComponents = <CallMessage message={message} />;
    } else if (message.type === "meet_link") {
      messageContentComponents = <MeetLinkMessage message={message} />;
    } else {
      const textContent = inSearch
        ? message.highlighted_text_content || message.text_content
        : message.text_content;

      messageContentComponents = messageTextToComponents(textContent || "", {
        inSearch
      });
    }

    return (
      <div
        properties={{ target: "_blank", className: "message-link" }}
        className="message-body-wrapper"
      >
        <div className="message-body">
          {messageContentComponents}
        </div>
        {(message.type === "upload" || message.type === "file_share") && (
          <FileAttachment
            {...message.fields}
            message={message}
            user_id={user.id}
            file_id={message.upload_id}
            isConversationMessage={isConversationMessage}
            onCommentsClick={
              isConversationMessage ? null : this.onCommentsClick
            }
          />
        )}
        <div className="message-body">

          {user && user.is_bot ? this.renderIntegrationLink() : null}
          {this.renderLinkPreviews()}
          {this.renderEdited()}
          <Reactions
            messageId={messageId}
            reactions={message.reactions_web}
            onToggle={this.onToggle}
          />
          <Replies
            message={message}
          />
        </div>
      </div>
    );
  }
}

MessageContent.defaultProps = {
  inSearch: false,
  isConversationMessage: false
};

MessageContent.propTypes = {
  inSearch: PropTypes.bool,
  user: PropTypes.any.isRequired,
  message: PropTypes.any.isRequired,
  isConversationMessage: PropTypes.bool.isRequired,
  messageStore: PropTypes.object.isRequired
};

export default MessageContent;
