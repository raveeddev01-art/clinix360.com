import React, { Component, PropTypes } from "react";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import CustomToggle from "./custom-toggle";

class UserMention extends Component {
  render() {
    return (
      <Dropdown id="user-mention" className="user-mention-dropdown">
        <CustomToggle bsRole="toggle">
          {`@${this.props.user.username}`}
        </CustomToggle>
        <Dropdown.Menu>
          <MenuItem eventKey="1">Direct Messaging</MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

UserMention.propTypes = {
  user: PropTypes.any.isRequired
};

export default UserMention;
