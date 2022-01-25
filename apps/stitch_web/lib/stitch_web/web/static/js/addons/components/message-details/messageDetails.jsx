import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Avatar, UserProfileMenu } from "common/components";
import MessageComment from "common/components/message/MessageComment";
import MessageCommentInput from "common/components/message/MessageCommentInput";
import MessageCommentGroup from "common/components/message/MessageCommentGroup";
import MessageInfo from "common/components/message/MessageInfo";

@inject("teamFileStore", "usersStore", "groupsStore", "desktopStore")
@observer
class MessageDetails extends Component {

  render() {
    const { message } = this.props;

    if (!message.id) return null;

    const messageCreator = this.props.usersStore.usersById[message.user_id];

    return (
      <div className="file-details-addon">
        <div className="file-heading">
          <Avatar user={messageCreator} />
          <div className="file-heading__content">
            <div className="file-heading__content-user">
              <UserProfileMenu user={messageCreator} className="name">
                {messageCreator.full_name}
              </UserProfileMenu>
            </div>
            <div className="file-heading__content-file">{message.text_content}</div>
          </div>
        </div>
        <MessageInfo message={message} />
        <span className="file-dot" />
        <MessageCommentGroup message={message} />
        <span className="spacer-10" />
        {/* {message.comments.map(comment => (
          <MessageComment comment={comment} key={comment.id} />
        ))} */}
        <MessageCommentInput message={message} />
      </div>
    );
  }
}

export default MessageDetails;
