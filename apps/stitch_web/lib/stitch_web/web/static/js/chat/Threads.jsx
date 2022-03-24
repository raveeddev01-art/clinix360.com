import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";
import { withRouter } from "react-router";

import MessagePanel from "./message-panel";
import Addons from "../addons/addons";
import ThreadsTopNav from "./top-nav/threads-top-nav";

@inject("groupsStore", "sidemenuStore")
@observer
class Threads extends Component {
  componentWillMount() {
    this.openGroup(this.props.match.params);
  }

  componentWillReceiveProps(nextProps) {
    this.openGroup(nextProps.match.params);
  }

  openGroup(params) {
    const { groupsStore } = this.props;
    groupsStore.openThreads();
  }

  render() {
    const { groupsStore, sidemenuStore } = this.props;
    const { currentGroup } = groupsStore;

    let title = "InvoChat";

    if (currentGroup) {
      title = `${groupsStore.getGroupName(currentGroup)} | InvoChat`;

      if (currentGroup.type === "regular") {
        title = `${groupsStore.getGroupName(
          currentGroup
        )} | ${sidemenuStore.teamName} | InvoChat`;
      }
    }

    return (
      <div className="chat-wrapper">
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <div id="main">
          <ThreadsTopNav />
          <div className="flex-content">
            <MessagePanel isThreadView={true}/>
            <Addons />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Threads);
