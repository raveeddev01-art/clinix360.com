import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import { NavLink } from "react-router-dom";

import { getRoomNavLink } from "../../../../lib/utils";

@inject("groupsStore")
class MessageFooter extends Component {
  getGroup() {
    const { groupsStore, message } = this.props;

    return groupsStore.getGroupById(message.group_id);
  }

  render() {
    const group = this.getGroup();

    return (
      <div className="message-footer">
        <NavLink to={getRoomNavLink(group)}>
          <i className="fa fa-tag" /> {group.name}
        </NavLink>
      </div>
    );
  }
}

MessageFooter.propTypes = {
  message: PropTypes.object.isRequired
};

export default MessageFooter;
