import React, { Component } from "react";
import PropTypes from "prop-types";
import AnalyticsChart from "./analytics-chart";

export default class ActiveUsers extends Component {
  makeHelperText(total) {
    return `Total Active Days: ${Number(total).toLocaleString()}`;
  }

  render() {
    return (
      <AnalyticsChart
        title="Daily Active Users"
        subtitle="Learn how often your team checks into Stitch."
        makeHelperText={this.makeHelperText}
        reportsData={this.props.reportsData}
      />
    );
  }
}

ActiveUsers.propTypes = {
  reportsData: PropTypes.object
};

ActiveUsers.defaultProps = {
  reportsData: null
};
