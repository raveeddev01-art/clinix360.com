import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";

class DateSeparator extends Component {
  renderTimestamp = () => {
    const { timestamp } = this.props;

    const today = moment.utc().local();
    const yesterday = moment(today)
      .subtract(1, "day")
      .format("YYYY-MM-DD");

    if (moment(timestamp).isSame(today.format("YYYY-MM-DD"), "day")) {
      return "Today";
    } else if (moment(timestamp).isSame(yesterday, "day")) {
      return "Yesterday";
    } else {
      return moment(timestamp).format("dddd, MMMM D");
    }
  };

  render() {
    return (
      <div className="date-separator">
        <span className="date">{this.renderTimestamp()}</span>
      </div>
    );
  }
}

DateSeparator.propTypes = {
  timestamp: PropTypes.any
};

export default DateSeparator;
