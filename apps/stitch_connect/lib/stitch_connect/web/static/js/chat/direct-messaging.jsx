import React, { Component } from "react";

import { inject, observer } from "mobx-react";

import MessagePanel from "./message-panel";
import Addons from "../addons/addons";
import TopNav from "./top-nav/top-nav";

@inject("groupStore", "sidemenuStore")
@observer
export default class DirectMessaging extends Component {
  componentWillMount() {
    this.joinMessaging(this.props.match.params.usernames);
  }

  componentWillReceiveProps(nextProps) {
    this.joinMessaging(nextProps.match.params.usernames);
  }

  joinMessaging = param => {
    const usernames = param.split(",");
    const users = this.props.sidemenuStore.users;
    if (usernames.length === 1) {
      const user = users.find(u => u.username === usernames[0]);
      this.props.groupStore.joinSingleDM(user);
    }
  };

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
