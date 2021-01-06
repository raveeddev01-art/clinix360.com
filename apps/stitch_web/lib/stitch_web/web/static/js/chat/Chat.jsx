import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";
import { withRouter } from "react-router";

import MessagePanel from "./message-panel";
import Addons from "../addons/addons";
import TopNav from "./top-nav/top-nav";

@inject("groupsStore", "sidemenuStore")
@observer
class Chat extends Component {
  componentWillMount() {
    this.openGroup(this.props.match.params);
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.match.params.slug !== nextProps.match.params.slug ||
      this.props.match.params.usernames !== nextProps.match.params.usernames
    ) {
      this.openGroup(nextProps.match.params);
    }
  }

  openGroup(params) {
    const { groupsStore } = this.props;

    if (params.slug) {
      groupsStore.openGroup(params.slug);
    } else if (params.usernames) {
      groupsStore.openDMGroup(params.usernames.split(","));
    }
  }

  render() {
    const { groupsStore, sidemenuStore } = this.props;
    const { currentGroup } = groupsStore;

    let title = "InvoCom";

    if (currentGroup) {
      title = `${groupsStore.getGroupName(currentGroup)} | InvoCom`;

      if (currentGroup.type === "regular") {
        title = `${groupsStore.getGroupName(currentGroup)} | ${
          sidemenuStore.teamName
        } | InvoCom`;
      }
    }

    return (
      <div className="chat-wrapper">
        <Helmet>
          <title>{title}</title>
        </Helmet>
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

export default withRouter(Chat);
