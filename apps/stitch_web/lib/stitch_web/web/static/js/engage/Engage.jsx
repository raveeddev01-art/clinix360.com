import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";
import { withRouter } from "react-router";

import InboxMenu from "./inbox/inbox";

@inject("teamStore")
@observer
class Engage extends Component {
  render() {
    const { teamStore } = this.props;

    return (
      <div className="engage-wrapper">
        <Helmet>
          <title>{`${teamStore.name} | Stitch Engage`}</title>
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
