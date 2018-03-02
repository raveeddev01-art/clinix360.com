import React, { Component } from "react";
import PropTypes from "prop-types";

class LogItem extends Component {
  render() {
    return (
      <div className="access-log-item">
        <img
          className="access-log-item__avatar"
          src={
            "http://static2.businessinsider.com/image/5899ffcf6e09a897008b5c04-1200/.jpg"
          }
          alt="avatar"
        />
        <div className="access-log-item__user">
          <p className="access-log-item__user__name">{this.props.fullName}</p>
          <p className="access-log-item__user__time">
            <span>{this.props.time}</span> with the
            <span className="access-log-item__user__app">
              <i className={this.props.application.icon} />
              {this.props.application.name}{" "}
            </span>
          </p>
          <p className="access-log-item__user__ip">IP {this.props.ipAddress}</p>
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
