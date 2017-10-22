import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";
import moment from "moment";

import MessageList from "./message-list/message-list";
import MessageForm from "./message-form/message-form";
import UploadProgress from "../file-upload/upload-progress";

@inject("groupStore", "messageStore", "sidemenuStore")
@observer
export default class MessagePanel extends Component {
  componentWillMount() {
    document.addEventListener("keydown", this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown);
  }

  onKeyDown = evt => {
    const { messageStore } = this.props;

    if (evt.keyCode === 27) {
      // ESC key
      messageStore.markAsRead();
    }
  };

  onUnreadMessagesCountClick = () => {
    const { messageStore } = this.props;

    if (messageStore.firstUnreadMessage) {
      // if messages are already loaded
      if (messageStore.firstUnreadMessageVisibility === "visible") {
        messageStore.markAsRead();
      } else {
        messageStore.scrollToNewBanner();
      }
    } else {
      // if unread messages are not loaded yet, just load next batch
      messageStore.loadPastUnreadMessages();
    }
  };

  onMarkAsReadClick = () => {
    const { messageStore } = this.props;

    messageStore.markAsRead();
  };

  handleJoin = () => {
    const { groupStore } = this.props;

    groupStore.join();
  };

  renderUnreadMessagesBar() {
    const { messageStore } = this.props;
    const unreadMessagesTooltipClass = classNames("unread-messages-tooltip", {
      "should-jump": messageStore.firstUnreadMessageVisibility !== "visible"
    });
    const jumpArrowClass = classNames("fa", {
      "fa-arrow-up": messageStore.firstUnreadMessageVisibility === "hidden-up",
      "fa-arrow-down":
        messageStore.firstUnreadMessageVisibility === "hidden-down"
    });

    return (
      messageStore.unreadMessagesCount > 0 && (
        <div className={unreadMessagesTooltipClass}>
          <div
            role="button"
            className="messages-count-info"
            onClick={this.onUnreadMessagesCountClick}
          >
            <div className="jump-button">
              <i className={jumpArrowClass} />
              <span className="jump-hover">Jump</span>
            </div>
            <div className="messages-count">
              {messageStore.unreadMessagesCount} new message{messageStore.unreadMessagesCount > 1 && "s"}{" "}
              since{" "}
              {moment(messageStore.lastReadAt).format("h:mm A on MMMM Do")}
            </div>
          </div>

          <div
            role="button"
            className="mark-as-read-button"
            onClick={this.onMarkAsReadClick}
          >
            Mark as read
            <i className="fa fa-close" />
          </div>
        </div>
      )
    );
  }

  render() {
    const { groupStore: group } = this.props;

    return (
      <div id="chat-container">
        <div className="container-bars">
          {this.renderUnreadMessagesBar()}
          <UploadProgress />
        </div>

        <MessageList />
        <div className="flex-footer">
          {!group.loading ? (
            group.joined ? (
              <MessageForm />
            ) : (
              <div className="room-preview">
                This is a preview of the room{" "}
                <strong>
                  <i className="fa fa-comments" /> {group.name}
                </strong>
                <button
                  className="join btn btn-fancy btn-primary"
                  onClick={this.handleJoin}
                >
                  <i className="fa fa-sign-in" /> Join
                </button>
              </div>
            )
          ) : null}
        </div>
      </div>
    );
  }
}
