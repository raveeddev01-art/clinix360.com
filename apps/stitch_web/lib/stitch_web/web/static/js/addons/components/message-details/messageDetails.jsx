import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Avatar, UserProfileMenu } from "common/components";
import MessageComment from "common/components/message/MessageComment";
import MessageCommentInput from "common/components/message/MessageCommentInput";
import MessageCommentGroup from "common/components/message/MessageCommentGroup";
import MessageInfo from "common/components/message/MessageInfo";
import LinkPreview from "../../../common/components/messages/message-content/link-preview";

@inject("messageStore", "usersStore", "groupsStore", "desktopStore")
@observer
class MessageDetails extends Component {

  renderLinkPreviews() {
    const {
      message: { link_previews: linkPreviews, id },
      message,
      messageStore
    } = this.props;

    if (linkPreviews && linkPreviews.length) {
      return linkPreviews.map((link, index) => (
        <LinkPreview
          key={`message_${id}_link_${index}`}
          {...link}
          deleteLinkPreview={messageStore.deleteLinkPreview}
          messageId={id}
          senderId={message.user_id}
        />
      ));
    }

    return null;
  }

  render() {
    const { message } = this.props.messageStore;

    if (!message.id) return null;

    const messageCreator = this.props.usersStore.usersById[message.user_id];

    return (
      <div className="search-results-addon">
        <div className="file-heading">
          <Avatar user={messageCreator} />
          <div className="file-heading__content">
            <div className="file-heading__content-user">
              <UserProfileMenu user={messageCreator} className="name">
                {messageCreator.full_name}
              </UserProfileMenu>
            </div>
            <div className="file-heading__content-file">{message.text_content}</div>
            {this.renderLinkPreviews()}
          </div>
        </div>
        <MessageInfo message={message} />
        <span className="file-dot" />
        <MessageCommentGroup message={message} />
        <span className="spacer-10" />
        {message.thread_messages.map(comment => (
          <MessageComment comment={comment} key={comment.id} />
        ))}
        <MessageCommentInput message={message} />
      </div>
    );
  }
}

export default MessageDetails;
