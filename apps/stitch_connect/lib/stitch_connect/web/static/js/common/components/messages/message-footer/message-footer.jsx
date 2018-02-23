import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import { NavLink } from "react-router-dom";

@inject("groupsStore")
class MessageFooter extends Component {
  render() {
    const { groupsStore, message } = this.props;
    const group = groupsStore.getGroupById(message.group_id);
    const url = groupsStore.getGroupUrl(message.group_id);

    return (
      <div className="message-footer">
        <NavLink to={url}>
          <i className="fa fa-comments" /> {group.name}
        </NavLink>
      </div>
    );
  }
}

MessageFooter.propTypes = {
  message: PropTypes.object.isRequired
};

export default MessageFooter;
