import React, { Component } from "react";

import { inject, observer } from "mobx-react";

import MessagePanel from "./message-panel";
import Addons from "../addons/addons";
import TopNav from "./top-nav/top-nav";
import UploadProgress from "../file-upload/upload-progress";

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
    } else {
      const dmUsers = usernames.map(username =>
        users.find(u => u.username === username)
      );
      this.props.groupStore.joinMultiDM(dmUsers);
    }
  };

  render() {
    return (
      <div className="chat-wrapper">
        <div id="main">
          <TopNav />
          <UploadProgress />
          <div className="flex-content">
            <MessagePanel />
            <Addons />
          </div>
        </div>
      </div>
    );
  }
}
