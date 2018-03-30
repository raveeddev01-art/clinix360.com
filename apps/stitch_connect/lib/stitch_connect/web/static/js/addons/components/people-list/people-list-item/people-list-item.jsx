import React, { Component } from "react";
import PropTypes from "prop-types";
import { Avatar } from "common/components";

class PeopleListItem extends Component {
  render() {
    const { user, onClick, online } = this.props;

    return (
      <div className="people-list-item" onClick={onClick}>
        <div className="item-icon">
          {online ? (
            <i className="fa fa-circle" />
          ) : (
            <i className="fa fa-circle-o" />
          )}
        </div>
        <div className="item-text">
          <Avatar user={user} />
          <span>{`${user.first_name} ${user.last_name}`}</span>
          <small>{user.username}</small>
        </div>
      </div>
    );
  }
}

PeopleListItem.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired
  }),
  online: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

PeopleListItem.defaultProps = {
  user: {
    username: "",
    first_name: "",
    last_name: "",
    online: ""
  }
};

export default PeopleListItem;
