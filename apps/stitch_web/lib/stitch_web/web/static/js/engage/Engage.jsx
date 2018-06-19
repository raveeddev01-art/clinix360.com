import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";
import { withRouter } from "react-router";

import InboxMenu from "./inbox/inbox";

@inject("inboxStore")
@observer
class Engage extends Component {
  render() {
    const { inboxStore } = this.props;

    return (
      <div className="engage-wrapper">
        <Helmet>
          <title>{`${inboxStore.defaultInbox.name} | Stitch Connect`}</title>
        </Helmet>

        <InboxMenu />

        <div id="main">
          <div className="flex-content">
            <div>
              <h1>engage panel</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Engage);
