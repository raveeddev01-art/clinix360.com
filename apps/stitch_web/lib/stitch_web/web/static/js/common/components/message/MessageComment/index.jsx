import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import Message from "../../../../chat/message-list/message";

@inject("usersStore", "teamFileStore", "messageStore")
@observer
class MessageComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commentText: props.comment.text_content || ''
    };
  }

  render() {
    const { comment, messageStore, usersStore } = this.props;
    const user = usersStore.usersById[comment.user_id];

    return (
      <Message
        edited_at={comment.edited_at}
        isReply={true}
        messageUser={user}
        pinned={comment.pinned}
        starred={comment.starred}
        status={comment.status}
        is_sequential={comment.is_sequential}
        reactions_web={comment.reactions_web}
        link_previews={comment.link_previews}
        key={`comment_${comment.id}`}
        message={comment}
        lastOtherUserMessage={messageStore.lastOtherUserMessage}
        messageStore={messageStore}
        chatDiv={messageStore.chatDiv}
        onMounted={messageStore.onMessageMounted}
        onUnmounted={messageStore.onMessageUnmounted}
        onShow={messageStore.onMessageShow}
        onHide={messageStore.onMessageHide}
        inThread={true}
      />
    );
  }
}

MessageComment.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.number.isRequired
  }).isRequired
};

export default MessageComment;
