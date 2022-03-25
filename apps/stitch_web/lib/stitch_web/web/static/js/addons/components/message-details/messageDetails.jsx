import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Message from "../../../chat/message-list/message";
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
    const { messageStore, usersStore } = this.props;
    const { message } = messageStore;

    if (!message.id) return null;

    const messageCreator = usersStore.usersById[message.user_id];

    return (
      <div className="search-results-addon">
        <div className="file-heading">
          <Message
            edited_at={message.edited_at}
            isReply={true}
            messageUser={messageCreator}
            pinned={message.pinned}
            starred={message.starred}
            status={message.status}
            is_sequential={message.is_sequential}
            reactions_web={message.reactions_web}
            link_previews={message.link_previews}
            key={`message_${message.id}`}
            message={message}
            messageStore={messageStore}
            chatDiv={messageStore.chatDiv}
            onMounted={messageStore.onMessageMounted}
            onUnmounted={messageStore.onMessageUnmounted}
            onShow={messageStore.onMessageShow}
            onHide={messageStore.onMessageHide}
            messageClass={"message-details"}
          />
        </div>
        <MessageInfo message={message} />
        <span className="file-dot" />
        <MessageCommentGroup message={message} />
        <span className="spacer-10" />
        {message.thread_messages && message.thread_messages.map(comment => (
          <MessageComment comment={comment} key={comment.id} />
        ))}
        <MessageCommentInput message={message} />
      </div>
    );
  }
}

export default MessageDetails;
