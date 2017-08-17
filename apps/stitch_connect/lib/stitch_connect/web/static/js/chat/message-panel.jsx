import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import MessageList from "./message-list/message-list";
import MessageForm from "./message-form/message-form";

@inject("groupStore")
@observer
export default class MessagePanel extends Component {
  handleJoin = () => {
    const { groupStore: group } = this.props;
    group.join();
  };
  render() {
    const { groupStore: group } = this.props;

    return (
      <div id="chat-container">
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
