import React, { Component, PropTypes } from "react";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";

class UserMention extends Component {
  goToDirectMessaging = () => {
    console.log("goToDirectMessaging");
  };

  render() {
    return (
      <Dropdown id="user-mention" className="user-mention-dropdown">
        <Dropdown.Toggle useAnchor noCaret>
          {`@${this.props.user.username}`}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <MenuItem onClick={this.goToDirectMessaging}>
            Direct Messaging
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

UserMention.propTypes = {
  user: PropTypes.any.isRequired
};

export default UserMention;
