import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";

class DateSeparator extends Component {
  render() {
    const { timestamp } = this.props;

    return (
      <div className="date-separator">
        <span className="date">
          {moment(timestamp).calendar(null, {
            sameDay: "[Today]",
            lastDay: "[Yesterday]",
            lastWeek: "dddd, MMMM D",
            sameElse: "dddd, MMMM D"
          })}
        </span>
      </div>
    );
  }
}

DateSeparator.propTypes = {
  timestamp: PropTypes.any.isRequired
};

export default DateSeparator;
