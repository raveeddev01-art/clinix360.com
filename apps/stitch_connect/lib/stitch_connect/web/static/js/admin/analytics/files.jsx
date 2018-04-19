import React, { Component } from "react";
import PropTypes from "prop-types";
import AnalyticsChart from "./analytics-chart";

export default class Files extends Component {
  makeHelperText(total) {
    return `Total Files Uploaded: ${Number(total).toLocaleString()}`;
  }

  render() {
    return (
      <AnalyticsChart
        title="Files"
        subtitle="Learn how your team has uploaded files."
        makeHelperText={this.makeHelperText}
        reportsData={this.props.reportsData}
      />
    );
  }
}

Files.propTypes = {
  reportsData: PropTypes.object
};

Files.defaultProps = {
  reportsData: null
};
