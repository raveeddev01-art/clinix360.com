import React, { Component } from "react";
import PropTypes from "prop-types";

class DayLog extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h2>Wednesday, February 14th</h2>
        {this.props.accessLogs.map((accessLog, i) => (
          <LogItem key={i} accessLog={accessLog} />
        ))}
      </div>
    );
  }
}

DayLog.propTypes = {
  date: PropTypes.object,
  accessLogs: PropTypes.arrayOf(Object)
};

export default DayLog;
