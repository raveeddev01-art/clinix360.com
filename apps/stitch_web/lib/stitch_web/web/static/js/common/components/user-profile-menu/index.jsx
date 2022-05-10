import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import { Avatar, SmartDropdown, PortalDropdownMenu } from "common/components";
import AvatarImage from "../avatar/avatar-image";

@inject("addonStore", "groupsStore", "presenceStore")
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
    const { user, className, children, disabledMenu, showMutedUsername, presenceStore } = this.props;

    if (!user) {
      return <div />;
    }

    if (window.currentPatient || user.mrn) {
      return <span>{children}</span>;
    }

    let online = presenceStore.isOnline(`${user.id}`);

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
            {/* <Avatar user={user} class="img-responsive img-rounded" hideProfileDropDown={true} /> */}
            <div className="user-avatar">
              <AvatarImage
                useThumb={false}
                className="img-responsive img-profile-dropdown"
                user={user}
              />
            </div>
          </div>
          <div className="content">
              <div className="full-name">
                {user.full_name}
                <span>{online ? (<i className="fa fa-circle" />) : (<i className="fa fa-circle-o" />)}</span>
              </div>
              <div className="user-title text-muted">{user.title}</div>
              {/* {showMutedUsername && <div className="username text-muted">{user.username}</div>} */}
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
