import React, { Component } from "react";
import { withRouter } from "react-router-dom";

class RoomItem extends Component {
  handleClick = () => {
    const { room, toggleModal, history } = this.props;

    toggleModal();
    history.push(`/rooms/${room.slug}`);
  };

  render() {
    const { room } = this.props;

    return (
      <div className="group-item" role="link" onClick={this.handleClick}>
        <div className="content">
          <div className="name">
            <i className="fa fa-comments" /> {room.name}
            <span className="text-muted">#{room.slug}</span>
          </div>

          <div className="member-count text-muted">
            <i className="fa fa-user-o" />
            {room.user_count}
          </div>
        </div>

        <div className="description text-muted">{room.description}</div>
      </div>
    );
  }
}

export default withRouter(RoomItem);
