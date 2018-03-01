import React, { Component } from "react";
import PropTypes from "prop-types";

class LogItem extends Component {
  constructor(props) {
    super(props);
  }

  _renderApplication = application => {
    console.log(application);
    switch (application) {
      case "iOS":
        return "FOobar";
      default:
        return "Foobar";
    }
  };

  render() {
    return (
      <div>
        <img src={this.props.avatar} alt="avatar" />
        <div>
          <p>{this.props.fullName}</p>
          <p>
            <span>{this.props.time}</span> with the{" "}
            <span>
              {this.props.application.name}{" "}
              <i className={this.props.application.icon} />
            </span>
          </p>
          <p>IP {this.props.ipAddress}</p>
        </div>
      </div>
    );
  }
}

LogItem.propTypes = {
  avatar: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  application: PropTypes.object.isRequired,
  ipAddress: PropTypes.string.isRequired
};

export default LogItem;
