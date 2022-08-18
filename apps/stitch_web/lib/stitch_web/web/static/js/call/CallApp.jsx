import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { AppAlert, Loading } from "common/components";
import { Helmet } from "react-helmet";
import Tokbox from "./Tokbox";

@inject("groupsStore", "callStore")
@observer
class CallApp extends Component {
  render() {
    const { groupsStore, sidemenuStore, callStore } = this.props;
    const { currentGroup } = groupsStore;
    const { connected } = callStore;
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
      <div>
        {!connected && <Loading title="Connecting" />}
        <AppAlert />
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <div id="main">
          <Tokbox {...this.props} />
        </div>
      </div>
    );
  }
}

export default CallApp;
