import React, { Component } from "react";
import PropTypes from "prop-types";

class PeopleListItem extends Component {
  render() {
    const { onClick, username, first_name, last_name, online } = this.props;

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
          <span>{`${first_name} ${last_name}`}</span>
          <small>{username}</small>
        </div>
      </div>
    );
  }
}

PeopleListItem.propTypes = {
  username: PropTypes.string.isRequired,
  first_name: PropTypes.string.isRequired,
  last_name: PropTypes.string.isRequired,
  online: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

export default PeopleListItem;
