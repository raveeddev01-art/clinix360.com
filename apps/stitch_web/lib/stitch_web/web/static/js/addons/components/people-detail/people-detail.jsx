import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { inject, observer } from "mobx-react";
import Button from "react-bootstrap/lib/Button";
import AvatarImage from "../../../common/components/avatar/avatar-image";
import UserStatus from "../../../common/components/user-status";
import UserStatusModal from "../../../common/modals/user-status-modal";

// @TODO load time zone from user
@inject("presenceStore", "usersStore", "userStore")
@observer
class PeopleDetail extends Component {

  toggleUpdateStatusModal = () => {
    this.props.userStore.showUserStatusModal = true;
  };

  render() {
    const timezone = moment().format("hh:mm A (Z)");
    const user = this.props.usersStore.getUserById(this.props.user.id);
    const { full_name, title, username, email, phone, is_bot } = user;
    const displayName = is_bot ? username : full_name;

    const isOwnProfile = currentUser.id === this.props.user.id;
    const online = this.props.presenceStore.isOnline(`${this.props.user.id}`);

    return (
      <div className="user-view">
        <div className="user-avatar m-b-20">
          <AvatarImage
            useThumb={false}
            className="img-responsive img-rounded"
            user={user}
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
            {displayName}
          </h4>
          <div className="user-title text-muted">{title}</div>
          <UserStatus key={`user-status-${user.id}`} user={user} type={isOwnProfile ? "editable" : "readonly"} showFullText={true}/>
          <Button bsStyle="primary" onClick={this.toggleUpdateStatusModal}>
            {user.status.active ? "Edit status" : "Set a status"}
          </Button>
          <UserStatusModal key={`user-status-modal`} user={user} />
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
