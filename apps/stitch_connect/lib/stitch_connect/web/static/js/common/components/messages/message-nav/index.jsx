import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { inject } from "mobx-react";
import { NavLink } from "react-router-dom";

@inject("groupsStore")
class MessageNav extends Component {
  render() {
    const { groupsStore, message } = this.props;
    const group = groupsStore.getGroupById(message.group_id);
    const url = groupsStore.getGroupUrl(message.group_id);
    const now = moment();

    return (
      <div className="message-nav m-b-5">
        <NavLink to={url}>
          <i
            className={`fa ${group.public ? "fa-comments" : "fa-lock"}`}
          />{" "}
          {group.name}
        </NavLink>

        <span className="m-l-10">
          {moment
            .utc(message.inserted_at)
            .local()
            .calendar(null, {
              sameDay: "[Today]",
              lastDay: "[Yesterday]",
              lastWeek: "dddd, MMMM D",
              sameElse: function() {
                if (this.year() === now.year()) {
                  return "MMM Do";
                } else {
                  return "MMM Do, YYYY";
                }
              }
            })}
        </span>
      </div>
    );
  }
}

MessageNav.propTypes = {
  message: PropTypes.object.isRequired
};

export default MessageNav;
