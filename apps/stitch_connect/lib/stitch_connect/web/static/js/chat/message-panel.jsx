import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import MessageList from "./message-list/message-list";
import MessageForm from "./message-form/message-form";
import UploadProgress from "../file-upload/upload-progress";

@inject("groupStore", "messageStore")
@observer
export default class MessagePanel extends Component {
  componentWillMount() {
    document.addEventListener("keydown", this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown);
  }

  onKeyDown = evt => {
    if (evt.keyCode === 27) {
      // ESC key
      this.markAsRead();
    }
  };

  onTooltipClose = evt => {
    evt.stopPropagation();
    this.markAsRead();
  };

  markAsRead = () => {
    this.props.messageStore.markAsRead();
  };

  handleJoin = () => {
    const { groupStore: group } = this.props;

    group.join();
  };

  loadMore = () => {
    const { messageStore } = this.props;

    if (messageStore.firstUnreadMessage) {
      // if messages are already loaded
      messageStore.scrollToNewBanner();
    } else {
      // if unread messages are not loaded yet, just load next batch
      messageStore.loadPastUnreadMessages();
    }
  };

  render() {
    const { groupStore: group, messageStore } = this.props;

    return (
      <div id="chat-container">
        <div className="container-bars">
          {messageStore.unreadMessagesCount > 0
            ? <div className="unread-messages-tooltip" onClick={this.loadMore}>
                {messageStore.unreadMessagesCount} new message{messageStore.unreadMessagesCount > 1 && "s"}
                <i
                  className="fa fa-close close-unread-messages-tooltip"
                  onClick={this.onTooltipClose}
                />
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
