import React, { Component } from "react";
import PropTypes from "prop-types";

class LogItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <img src={this.props.avatar} />
        <div>
          <p>{this.props.fullName}</p>
          <p>
            <span>{this.props.time}</span> with the{" "}
            <span>{this.props.application}</span>
          </p>
          <p>IP {this.props.ipAddress}</p>
        </div>
      </div>
    );
  }
}

LogItem.propTypes = {
  avatar: PropTypes.string,
  fullName: PropTypes.string,
  time: PropTypes.string,
  application: PropTypes.string,
  ipAddress: PropTypes.string
};

export default LogItem;
