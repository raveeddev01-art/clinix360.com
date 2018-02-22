import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import cx from "classnames";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import { Avatar, SmartDropdown } from "common/components";

@inject("addonStore")
@observer
class UserMention extends Component {
  goToDirectMessaging = () => {
    const { history, user } = this.props;
    const { username } = user;

    history.push(`/direct/${username}`);
  };

  _toggleAddonMenu = () => {
    const { addonStore, user } = this.props;

    addonStore.setAddonPanel("directory");
    addonStore.toggleAddons(true);
    addonStore.toggleAddonDetail(true);
    addonStore.setAddonDetailPanel("people", user);
  };

  render() {
    const { user: mentionedUser } = this.props;

    const mentionClassName = cx({
      me: mentionedUser.username === currentUser.username
    });

    return (
      <SmartDropdown id="user-mention" className="user-mention-dropdown">
        <Dropdown.Toggle className={mentionClassName} useAnchor noCaret>
          {`@${mentionedUser.username}`}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <div className="header">
            <Avatar user={mentionedUser} size="lg" />

            <div className="content">
              <div className="name">{mentionedUser.full_name}</div>

              <div className="username">{mentionedUser.username}</div>
            </div>
          </div>
          <MenuItem onClick={this._toggleAddonMenu}>View Profile</MenuItem>

          <MenuItem onClick={this.goToDirectMessaging}>
            Direct Messages
          </MenuItem>
        </Dropdown.Menu>
      </SmartDropdown>
    );
  }
}

UserMention.propTypes = {
  user: PropTypes.any.isRequired
};

export default withRouter(UserMention);
