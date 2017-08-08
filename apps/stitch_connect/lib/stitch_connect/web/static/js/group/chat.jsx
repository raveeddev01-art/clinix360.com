import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Message from "./message.jsx";
import TopNav from "./top-nav/top-nav.jsx";

@inject("groupStore")
@observer
export default class Chat extends Component {
  handleJoin = () => {
    const { groupStore: group } = this.props;
    group.join();
  };
  render() {
    const { groupStore: group } = this.props;

    return (
      <div id="chat-container">
        <div id="chat">
          <div className="date-separator">
            <span className="date">July 13, 2017</span>
          </div>
          <Message />
        </div>
        <div className="flex-footer">
          {group.joined
            ? <input
                type="text"
                className="form-control"
                placeholder="Write something"
              />
            : <div className="room-preview">
                This is a preview of the group <strong><i className="fa fa-tag"></i>{group.name}</strong>
                <button className="join btn btn-fancy btn-primary" onClick={this.handleJoin}>
                  <i className="fa fa-sign-in"></i> Join
                </button>
              </div>
          }
          
        </div>
      </div>
    );
  }
}
