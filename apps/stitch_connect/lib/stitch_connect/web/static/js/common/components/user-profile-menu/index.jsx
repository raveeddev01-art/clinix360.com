import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import { Avatar, SmartDropdown } from "common/components";

@inject("addonStore")
@observer
class UserProfileMenu extends Component {
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
    const { user, className, children } = this.props;

    return (
      <SmartDropdown id="user-profile-menu" className="user-mention-dropdown">
        <Dropdown.Toggle className={className} useAnchor noCaret>
          {children}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <div className="header">
            <Avatar user={user} size="lg" />

            <div className="content">
              <div className="full-name">{user.full_name}</div>

              <div className="username">{user.username}</div>
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

UserProfileMenu.propTypes = {
  user: PropTypes.any.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

UserProfileMenu.defaultProps = {
  className: '',
};

export default withRouter(UserProfileMenu);
