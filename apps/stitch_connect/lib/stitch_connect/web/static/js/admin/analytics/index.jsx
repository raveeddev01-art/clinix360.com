import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import DropdownButton from "react-bootstrap/lib/DropdownButton";
import MenuItem from "react-bootstrap/lib/MenuItem";

import Files from "./files";
import Messages from "./messages";

const header = (
  <h1>
    <i className="fa fa-bar-chart" /> Analytics
  </h1>
);

const datePeriodNames = {
  week: "Last 7 days",
  month: "Last 30 days",
  allTime: "All time"
};

@inject("titleStore")
@observer
export default class Analytics extends Component {
  constructor(props) {
    super(props);

    this.state = {
      timePeriod: "month",
      messagesData: null,
      filesData: null
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Analytics");
    this.loadReports(this.state.timePeriod);
  }

  _handleSelect = key => {
    this.setState({
      timePeriod: key
    });
    this.loadReports(key);
  };

  loadReports = key => {
    const timePeriod = datePeriodNames[key].toLowerCase();

    post("/api/v1/reports", {
      body: {
        type: "Messages Sent",
        time_period: timePeriod
      }
    }).then(resp => {
      const { data } = resp.data;
      this.setState({
        messagesData: data
      });
    });

    post("/api/v1/reports", {
      body: {
        type: "Files Uploaded",
        time_period: timePeriod
      }
    }).then(resp => {
      const { data } = resp.data;
      this.setState({
        filesData: data
      });
    });
  };

  render() {
    const { timePeriod, messagesData, filesData } = this.state;

    return (
      <Panel className="admin-panel analytics-panel" header={header}>
        <div className="pull-right period-dropdown">
          <DropdownButton
            id="dropdown-analytics-timespan"
            pullRight
            title={datePeriodNames[timePeriod]}
            className="dropdown-timespan"
            onSelect={this._handleSelect}
          >
            <MenuItem eventKey="week">Last 1 week</MenuItem>
            <MenuItem eventKey="month">Last 30 days</MenuItem>
            <MenuItem eventKey="allTime">All time</MenuItem>
          </DropdownButton>
        </div>
        <Messages reportsData={messagesData} />
        <Files reportsData={filesData} />
      </Panel>
    );
  }
}
