import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";

// @TODO load time zone from user
class PeopleDetail extends Component {
  render() {
    const { user } = this.props;

    return (
      <div className="user-view">
        <div className="username-and-title">
          <h4 className="display-name">{`${user.first_name} ${user.last_name}`}</h4>
          <div className="user-title text-muted">{user.title}</div>
        </div>
        <ul className="userinfo">
          <li className="userinfo__item">
            <span className="userinfo__label text-muted">Username</span>
            <span className="userinfo__value">@{user.username}</span>
          </li>
          <li className="userinfo__item">
            <span className="userinfo__label text-muted">Timezone</span>
            <span className="userinfo__value">
              {moment().format("hh:mm A (Z)")}
            </span>
          </li>
          <li className="userinfo__item">
            <span className="userinfo__label text-muted">Email Address</span>
            <span className="userinfo__value">{user.email}</span>
          </li>
          <li className="userinfo__item">
            <span className="userinfo__label text-muted">Phone Number</span>
            <span className="userinfo__value">{user.phone}</span>
          </li>
        </ul>
      </div>
    );
  }
}

PeopleDetail.propTypes = {
  user: PropTypes.object.isRequired
};

export default PeopleDetail;
