import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";
import { withRouter } from "react-router";

import ReconnectionAlert from "./reconnection-alert";
import MessagePanel from "./message-panel";
import Addons from "../addons/addons";
import TopNav from "./top-nav/top-nav";

@inject("groupsStore", "sidemenuStore", "messageStore")
@observer
class Chat extends Component {
  componentWillMount() {
    this.openGroup(this.props.match.params);
  }

  openGroup(params) {
    const { groupsStore, messageStore } = this.props;

    messageStore.stopTyping();

    if (params.slug) {
      groupsStore.openGroup(params.slug);
    } else if (params.usernames) {
      groupsStore.openDMGroup(params.usernames.split(","));
    }
  }

  render() {
    const { groupsStore: { currentGroup }, sidemenuStore } = this.props;
    let title = "Stitch Connect";

    if (currentGroup) {
      title = `${currentGroup.name} | Stitch Connect`;

      if (currentGroup.type === "regular") {
        title = `${currentGroup.name} | ${sidemenuStore.teamName} | Stitch Connect`;
      }
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
