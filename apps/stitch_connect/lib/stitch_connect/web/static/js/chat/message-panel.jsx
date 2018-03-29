import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";
import moment from "moment";
import history from "lib/history";

import MessageList from "./message-list/message-list";
import MessageForm from "./message-form/message-form";
import UploadProgress from "../file-upload/upload-progress";

@inject("groupStore", "messageStore", "groupsStore")
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
      // if messages are already loaded, mark it as read, but leave the NML
      if (messageStore.firstUnreadMessageVisibility === "visible") {
        messageStore.markAsRead(false);
      } else {
        messageStore.scrollToNewBanner();
      }
    } else {
      messageStore.scrollToNewBanner();
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

  handleClose = () => {
    history.push(`/rooms/${this.props.groupsStore.defaultGroup.slug}`);
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
              {moment
                .utc(messageStore.lastReadAt)
                .local()
                .format("h:mm A on MMMM Do")}
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

  renderFooter() {
    const { groupStore, groupsStore } = this.props;

    if (groupsStore.isCurrentGroupDeactivated) {
      const text =
        groupsStore.currentGroup.type === "dm"
          ? "You are viewing the message history of a deactivated account."
          : "You are viewing the message history of deactivated accounts.";
      return (
        <div className="flex-footer">
          <div className="room-preview">
            {text}
            <button
              className="join btn btn-fancy btn-default"
              onClick={this.handleClose}
            >
              <i className="fa fa-sign-in" /> Close
            </button>
          </div>
        </div>
      );
    }

    if (!groupStore.group.joined) {
      return (
        <div className="flex-footer">
          <div className="room-preview">
            This is a preview of the room{" "}
            <b>
              <i className="fa fa-comments" /> {groupStore.group.name}
            </b>
            <button
              className="join btn btn-fancy btn-primary"
              onClick={this.handleJoin}
            >
              <i className="fa fa-sign-in" /> Join
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-footer">
        <MessageForm />
      </div>
    );
  }

  render() {
    const { messageStore } = this.props;
    const chatContainerClassName = classNames({
      loaded: messageStore.loadedInitial
    });

    return (
      <div id="chat-container" className={chatContainerClassName}>
        <div className="container-bars">
          {this.renderUnreadMessagesBar()}
          <UploadProgress />
        </div>

        <MessageList />
        {this.renderFooter()}
      </div>
    );
  }
}
