import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import { withRouter } from "react-router-dom";

@inject("groupsStore")
class RoomItem extends Component {
  handleClick = () => {
    const { room, closeModal, history } = this.props;

    closeModal();
    history.push(`/rooms/${room.slug}`);
  };

  render() {
    const { room, groupsStore } = this.props;

    return (
      <div className="room-item" role="link" onClick={this.handleClick}>
        <div className="content">
          <div className="name">
            <i className="fa fa-comments" /> {groupsStore.getGroupName(room)}
            <span className="text-muted">#{room.slug}</span>
          </div>

          <div className="member-count text-muted">
            <i className="fa fa-users" />
            {room.users.filter(user => !user.disabled).length}
          </div>
        </div>
      </div>
    );
  }
}

RoomItem.propTypes = {
  room: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired
};

export default withRouter(RoomItem);
