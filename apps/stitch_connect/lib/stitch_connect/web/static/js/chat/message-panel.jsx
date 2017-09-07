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
      this.markAllAsRead();
    }
  };

  onTooltipClose = evt => {
    evt.stopPropagation();
    this.markAllAsRead();
  };

  markAllAsRead = () => {
    this.props.messageStore.markAllAsRead();
    this.props.groupStore.unreadMessagesCount = 0;
  };

  handleJoin = () => {
    const { groupStore: group } = this.props;

    group.join();
  };

  loadMore = () => {
    const { groupStore: group, messageStore } = this.props;

    if (messageStore.messages.length < group.unreadMessagesCount) {
      // if unread messages are not loaded yet, just load next batch
      messageStore.loadPastUnreadMessages();
    } else if (messageStore.newMessageBannerIndex >= 0) {
      // if messages are already loaded, and there is new message banner
      messageStore.scrollToNewBanner();
    }
  };

  render() {
    const { groupStore: group } = this.props;

    return (
      <div id="chat-container">
        <div className="container-bars">
          {group.unreadMessagesCount > 0
            ? <div className="unread-messages-tooltip" onClick={this.loadMore}>
                {group.unreadMessagesCount} new message{group.unreadMessagesCount > 1 && "s"}
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
