import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import MessageList from "./message-list/message-list";
import MessageForm from "./message-form/message-form";
import UploadProgress from "../file-upload/upload-progress";

@inject("groupStore", "messageStore")
@observer
export default class MessagePanel extends Component {
  handleJoin = () => {
    const { groupStore: group } = this.props;

    group.join();
  };

  jumpToLastUnreadMessage = () => {
    const { groupStore: group, messageStore } = this.props;
    get(`/api/v1/groups/${group.id}/messages?skip=${group.unreadMessagesCount}&limit=1`).then(result => {
      messageStore.jumpToMessage(result.data[0]);
      // @TODO mark all messages in the channel as read
    });
  };

  render() {
    const { groupStore: group } = this.props;

    return (
      <div id="chat-container">
        <div className="container-bars">
          {group.unreadMessagesCount > 0
            ? <div
                className="unread-messages-tooltip"
                onClick={this.jumpToLastUnreadMessage}
              >
                {group.unreadMessagesCount} new message{group.unreadMessagesCount > 1 && "s"}
              </div>
            : null}
          <UploadProgress />
        </div>

        <MessageList />
        <div className="flex-footer">
          {group.joined
            ? <MessageForm />
            : <div className="room-preview">
                This is a preview of the group{" "}
                <strong>
                  <i className="fa fa-tag" />
                  {group.name}
                </strong>
                <button
                  className="join btn btn-fancy btn-primary"
                  onClick={this.handleJoin}
                >
                  <i className="fa fa-sign-in" /> Join
                </button>
              </div>}
        </div>
      </div>
    );
  }
}
