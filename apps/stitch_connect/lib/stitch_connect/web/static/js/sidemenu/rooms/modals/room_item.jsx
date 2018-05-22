import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import { withRouter } from "react-router-dom";
import cx from "classnames";
import { getGroupUrl } from "lib/utils";

@inject("groupsStore")
class RoomItem extends Component {
  handleClick = () => {
    const { room, closeModal, history } = this.props;

    closeModal();
    history.push(getGroupUrl(room));
  };

  handleKeydown = e => {
    const code = e.charCode || e.keyCode;
    const spaceOrEnter = code === 32 || code === 13;
    if (spaceOrEnter) {
      this.handleClick();
      e.preventDefault();
    }
  };

  render() {
    const { hideSlug, room, groupsStore, hasManualFocus } = this.props;
    const roomItemClass = cx("room-item", { "manual-focus": hasManualFocus });

    return (
      <div
        tabIndex="0"
        className={roomItemClass}
        role="link"
        onClick={this.handleClick}
        onKeyDown={this.handleKeydown}
      >
        <div className="content">
          <div className="name">
            <i className="fa fa-comments" /> {groupsStore.getGroupName(room)}
            {!hideSlug && <span className="text-muted">#{room.slug}</span>}
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

RoomItem.defaultProps = {
  hideSlug: false,
  hasManualFocus: false
};

RoomItem.propTypes = {
  closeModal: PropTypes.func.isRequired,
  hasManualFocus: PropTypes.bool,
  hideSlug: PropTypes.bool,
  room: PropTypes.object.isRequired
};

export default withRouter(RoomItem);
