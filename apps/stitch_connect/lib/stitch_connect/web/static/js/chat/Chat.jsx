import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";
import { withRouter } from "react-router";

import ReconnectionAlert from "./reconnection-alert";
import MessagePanel from "./message-panel";
import Addons from "../addons/addons";
import TopNav from "./top-nav/top-nav";

@inject(
  "groupStore",
  "groupsStore",
  "sidemenuStore",
  "usersStore",
  "messageStore"
)
@observer
class Chat extends Component {
  componentWillMount() {
    this.joinChat(this.props.match.params);
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.match.params.slug !== nextProps.match.params.slug ||
      this.props.match.params.usernames !== nextProps.match.params.usernames
    ) {
      this.joinChat(nextProps.match.params);
    }
  }

  joinChat(params) {
    const { groupStore, groupsStore, usersStore, messageStore } = this.props;

    messageStore.stopTyping();

    if (params.slug) {
      groupStore.joinGroup(params.slug);
    } else if (params.usernames) {
      const users = usersStore.users;
      const usernames = params.usernames.split(",");

      if (usernames.length > 1) {
        const dmUsers = usernames
          .filter(username => username !== currentUser.username)
          .map(username => users.find(u => u.username === username));

        groupStore.joinMultiDM(dmUsers).then(() => groupsStore.loadGroups());
      } else {
        const user = users.find(u => u.username === usernames[0]);

        groupStore.joinSingleDM(user).then(() => groupsStore.loadGroups());
      }
    }
  }

  render() {
    const { groupStore, sidemenuStore } = this.props;
    let title = `${groupStore.group.name} | Stitch Connect`;
    if (groupStore.group.type === "regular") {
      title = `${groupStore.group
        .name} | ${sidemenuStore.teamName} | Stitch Connect`;
    }

    return (
      <div className="chat-wrapper">
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <div id="main">
          <TopNav />
          <ReconnectionAlert />
          <div className="flex-content">
            <MessagePanel />
            <Addons />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Chat);
