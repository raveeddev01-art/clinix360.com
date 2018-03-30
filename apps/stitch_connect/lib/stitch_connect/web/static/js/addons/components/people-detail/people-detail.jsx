import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { inject } from "mobx-react";

// @TODO load time zone from user
@inject("presenceStore")
class PeopleDetail extends Component {
  render() {
    const {
      user: { avatar, full_name: fullName, title, username, email, phone }
    } = this.props;
    const timezone = moment().format("hh:mm A (Z)");

    const online = this.props.presenceStore.isOnline(`${this.props.user.id}`);

    return (
      <div className="user-view">
        <div className="user-avatar m-b-20">
          <img
            src={avatar}
            alt="Avatar"
            className="img-responsive img-circle"
          />
        </div>

        <div className="username-and-title">
          <h4 className="display-name">
            <span className="m-r-5">
              {online ? (
                <i className="fa fa-circle" />
              ) : (
                <i className="fa fa-circle-o" />
              )}
            </span>
            {fullName}
          </h4>
          <div className="user-title text-muted">{title}</div>
        </div>

        <ul className="userinfo">
          {username && (
            <li className="userinfo__item">
              <span className="userinfo__label text-muted">Username</span>
              <span className="userinfo__value">@{username}</span>
            </li>
          )}

          <li className="userinfo__item">
            <span className="userinfo__label text-muted">Timezone</span>
            <span className="userinfo__value">{timezone}</span>
          </li>

          {email && (
            <li className="userinfo__item">
              <span className="userinfo__label text-muted">Email Address</span>
              <span className="userinfo__value">{email}</span>
            </li>
          )}

          {phone && (
            <li className="userinfo__item">
              <span className="userinfo__label text-muted">Phone Number</span>
              <span className="userinfo__value">{phone}</span>
            </li>
          )}
        </ul>
      </div>
    );
  }
}

PeopleDetail.propTypes = {
  user: PropTypes.object.isRequired
};

export default PeopleDetail;
