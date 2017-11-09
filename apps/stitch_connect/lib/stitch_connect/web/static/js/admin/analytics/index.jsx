import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";

import Files from "./files";
import Messages from "./messages";

const header = (
  <h1>
    <i className="fa fa-bar-chart" /> Analytics
  </h1>
);

@inject("titleStore")
@observer
export default class Analytics extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Analytics");
  }

  render() {
    return [
      <Panel
        key="panel-analytics-messages"
        className="admin-panel analytics-panel"
        header={header}
      >
        <Messages />
      </Panel>,
      <Panel
        key="panel-analytics-files"
        className="admin-panel analytics-panel"
      >
        <Files />
      </Panel>
    ];
  }
}
