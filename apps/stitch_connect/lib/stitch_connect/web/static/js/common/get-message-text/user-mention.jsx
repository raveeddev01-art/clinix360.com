import React, { Component, PropTypes } from "react";
import { withRouter } from "react-router-dom";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";

class UserMention extends Component {
  goToDirectMessaging = () => {
    const { history, user } = this.props;
    const { username } = user;

    history.push(`/direct/${username}`);
  };

  render() {
    const { username } = this.props.user;

    return (
      <Dropdown id="user-mention" className="user-mention-dropdown">
        <Dropdown.Toggle useAnchor noCaret>
          {`@${username}`}
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

export default withRouter(UserMention);
