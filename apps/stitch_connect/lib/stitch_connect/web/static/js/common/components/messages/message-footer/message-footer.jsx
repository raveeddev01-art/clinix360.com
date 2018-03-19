import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { inject } from "mobx-react";
import { NavLink } from "react-router-dom";

@inject("groupsStore")
class MessageFooter extends Component {
  render() {
    const { groupsStore, message } = this.props;
    const group = groupsStore.getGroupById(message.group_id);
    const url = groupsStore.getGroupUrl(message.group_id);

    return (
      <div className="message-footer m-b-5">
        <NavLink to={url}>
          <i
            className={`fa ${group.public ? "fa-comments" : "fa-lock"}`}
          />{" "}
          {group.name}
        </NavLink>

        <span className="pull-right text-muted">
          {moment
            .utc(message.inserted_at)
            .local()
            .format("MMM Do")}
        </span>
      </div>
    );
  }
}

MessageFooter.propTypes = {
  message: PropTypes.object.isRequired
};

export default MessageFooter;
