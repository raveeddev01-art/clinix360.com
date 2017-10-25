import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";

class DateSeparator extends Component {
  render() {
    const { timestamp } = this.props;

    return (
      <div className="date-separator">
        <span className="date">{moment(timestamp).format("dddd, MMMM D")}</span>
      </div>
    );
  }
}

DateSeparator.propTypes = {
  timestamp: PropTypes.any
};

export default DateSeparator;
