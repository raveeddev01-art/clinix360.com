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
            messageTextToComponents(message.text_content || "")
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
