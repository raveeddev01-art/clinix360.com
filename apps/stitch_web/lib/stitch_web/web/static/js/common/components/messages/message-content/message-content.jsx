import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import moment from "moment";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import FileAttachment from "./file-attachment";
import LinkPreview from "./link-preview";
import Reactions from "./reactions";
import messageTextToComponents from "../../../../chat/message-list/message-text-to-components";

@inject("usersStore", "messageStore", "addonStore")
@observer
class MessageContent extends Component {
  onToggle = emoji => {
    this.props.messageStore.toggleReaction(this.props.message.id, emoji);
  };

  onCommentsClick = () => {
    const { addonStore, message } = this.props;

    addonStore.setAddonPanel("files");
    addonStore.toggleAddons(true);
    addonStore.toggleAddonDetail(true);
    addonStore.setAddonDetailPanel("File Details", message.upload_id);
  };

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

  render() {
    const { inSearch, message } = this.props;
    const userId = message.user.id;
    const user = this.props.usersStore.usersById[userId];
    const textContent = inSearch
      ? message.highlighted_text_content || message.text_content
      : message.text_content;

    const messageContentComponents = messageTextToComponents(
      textContent || "",
      { inSearch }
    );

    return (
      <div
        properties={{ target: "_blank", className: "message-link" }}
        className="message-body-wrapper"
      >
        {message.type === "upload" && (
          <FileAttachment
            {...message.fields}
            onCommentsClick={this.onCommentsClick}
          />
        )}
        <div className="message-body">
          {message.type === "upload" && message.text_content ? (
            <div className="attachment-comment">{messageContentComponents}</div>
          ) : (
            messageContentComponents
          )}

          {user && user.is_bot ? this.renderIntegrationLink() : null}
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

MessageContent.defaultProps = {
  inSearch: false
};

MessageContent.propTypes = {
  inSearch: PropTypes.bool,
  message: PropTypes.any.isRequired
};

export default MessageContent;
