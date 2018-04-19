import React, { Component } from "react";
import PropTypes from "prop-types";
import AnalyticsChart from "./analytics-chart";

// TODO: DRY THIS UP WITH THE OTHER MESSAGES
export default class MessagesByPlatform extends Component {
  makeHelperText(total) {
    return `Total Messages Sent: ${Number(total).toLocaleString()}`;
  }

  labelForIndex(index) {
    return {
      0: "Mobile",
      1: "Desktop and Browser"
    }[index];
  }

  render() {
    return (
      <AnalyticsChart
        multiLine
        labelForIndex={this.labelForIndex}
        title="Messages By Type"
        subtitle="Learn how your team has sent messages."
        makeHelperText={this.makeHelperText}
        reportsData={this.props.reportsData}
      />
    );
  }
}

MessagesByPlatform.propTypes = {
  reportsData: PropTypes.object
};

MessagesByPlatform.defaultProps = {
  reportsData: null
};
