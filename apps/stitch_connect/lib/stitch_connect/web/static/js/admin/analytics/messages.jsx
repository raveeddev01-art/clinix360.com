import React, { Component } from "react";
import PropTypes from "prop-types";
import AnalyticsChart from "./analytics-chart";

export default class Messages extends Component {
  makeHelperText(total) {
    return `Total Messages Sent: ${Number(total).toLocaleString()}`;
  }

  render() {
    return (
      <AnalyticsChart
        title="Messages"
        subtitle="Learn how your team has sent messages."
        makeHelperText={this.makeHelperText}
        reportsData={this.props.reportsData}
      />
    );
  }
}

Messages.propTypes = {
  reportsData: PropTypes.object
};

Messages.defaultProps = {
  reportsData: null
};
