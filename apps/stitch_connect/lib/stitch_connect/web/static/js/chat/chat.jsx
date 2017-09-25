import React, { Component } from "react";
import { inject } from "mobx-react";

import MessagePanel from "./message-panel";
import Addons from "../addons/addons";
import TopNav from "./top-nav/top-nav";

@inject("groupStore", "sidemenuStore", "messageStore")
export default class Chat extends Component {
  componentWillMount() {
    this.joinChat(this.props.match.params);
  }

  componentWillReceiveProps(nextProps) {
    this.joinChat(nextProps.match.params);
  }

  joinChat(params) {
    const { groupStore, sidemenuStore, messageStore } = this.props;

    messageStore.stopTyping();
    if (params.slug) {
      groupStore.joinGroup(params.slug);
    } else if (params.usernames) {
      const usernames = params.usernames.split(",");
      const users = sidemenuStore.users;

      if (usernames.length === 1) {
        const user = users.find(u => u.username === usernames[0]);
        groupStore.joinSingleDM(user);
      } else {
        const dmUsers = usernames.map(username =>
          users.find(u => u.username === username)
        );
        groupStore.joinMultiDM(dmUsers);
      }
    } else {
      groupStore.joinGroup("general");
    }
  }

  render() {
    return (
      <div className="chat-wrapper">
        <div id="main">
          <TopNav />
          <div className="flex-content">
            <MessagePanel />
            <Addons />
          </div>
        </div>
      </div>
    );
  }
}
