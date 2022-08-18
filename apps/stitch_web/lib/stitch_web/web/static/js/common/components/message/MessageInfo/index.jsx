import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";

class MessageInfo extends Component {
  render() {
    const { message } = this.props;
    const addedOn = moment(message.inserted_at).format("D MMMM, YYYY");

    return (
      <small className="file-info">
        <span className="file-comment__group-item">{addedOn}</span>
      </small>
    );
  }
}

MessageInfo.propTypes = {
  message: PropTypes.object.isRequired
};

export default MessageInfo;
