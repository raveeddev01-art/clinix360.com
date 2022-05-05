import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import { Avatar, SmartDropdown, PortalDropdownMenu } from "common/components";

@inject("addonStore", "groupsStore")
@observer
class UserProfileMenu extends Component {
  goToDirectMessaging = () => {
    const { groupsStore, user } = this.props;
    const { id } = user;

    const dmUserIds = [id, currentUser.id];
    groupsStore.goToDM(dmUserIds);
  };

  _toggleAddonMenu = () => {
    const { addonStore, user } = this.props;

    addonStore.setAddonPanel("directory");
    addonStore.toggleAddons(true);
    addonStore.toggleAddonDetail(true);
    addonStore.setAddonDetailPanel("people", user);
  };

  render() {
    const { user, className, children, disabledMenu, showMutedUsername } = this.props;

    if (!user) {
      return <div />;
    }

    if (window.currentPatient || user.mrn) {
      return <span>{children}</span>;
    }

    return (
      <SmartDropdown
        id="user-profile-menu"
        className="user-profile-menu"
        disabled={disabledMenu}
      >
        <Dropdown.Toggle className={className} useAnchor noCaret>
          {children}
        </Dropdown.Toggle>
        <PortalDropdownMenu
          bsRole="menu"
          className="user-profile-menu-dropdown"
        >
          <div className="header">
            <Avatar user={user} size="sm" hideProfileDropDown={true} />

            <div className="content">
              <div className="full-name">{user.full_name}</div>
              {showMutedUsername && <div className="username text-muted">{user.username}</div>}
            </div>
          </div>
          <MenuItem onClick={this._toggleAddonMenu}>View Profile</MenuItem>

          {user &&
            !user.is_bot && (
              <MenuItem onClick={this.goToDirectMessaging}>
                Direct Messages
              </MenuItem>
            )}
        </PortalDropdownMenu>
      </SmartDropdown>
    );
  }
}

UserProfileMenu.propTypes = {
  user: PropTypes.any.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  disabledMenu: PropTypes.bool
};

UserProfileMenu.defaultProps = {
  className: "",
  disabledMenu: false,
  showMutedUsername: true
};

export default UserProfileMenu;
