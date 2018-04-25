import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import { isFullMember } from "lib/utils";

import Room from "../room";
import RoomsModal from "./modals/rooms_modal";

@inject("sidemenuStore")
@observer
class RoomsList extends Component {
  showRoomsListModal = () => {
    this.props.sidemenuStore.setModal("search");
  };

  showRoomCreateModal = () => {
    this.props.sidemenuStore.setModal("create");
  };

  closeModal = () => {
    this.props.sidemenuStore.closeModal();
  };

  render() {
    const { heading, rooms } = this.props;
    window.wat = this.showRoomsListModal;

    return (
      <div className="menu-nav m-b-20">
        <div className="heading">
          <h5>
            {isFullMember(currentUser) ? (
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="browse-rooms">Browse Rooms</Tooltip>}
              >
                <a role="button" onClick={this.showRoomsListModal}>
                  {heading}
                </a>
              </OverlayTrigger>
            ) : (
              heading
            )}
          </h5>

          {isFullMember(currentUser) && (
            <div className="heading__action">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="create-new-group">Create Room</Tooltip>}
              >
                <a role="button" onClick={this.showRoomCreateModal}>
                  <i className="fa fa-plus-square-o" />
                </a>
              </OverlayTrigger>
            </div>
          )}
        </div>

        {rooms.map(room => <Room key={`room-${room.id}`} room={room} />)}

        <RoomsModal
          state={this.props.sidemenuStore.currentModal}
          showRoomsListModal={this.showRoomsListModal}
          showRoomCreateModal={this.showRoomCreateModal}
          closeModal={this.closeModal}
        />
      </div>
    );
  }
}

RoomsList.propTypes = {
  heading: PropTypes.string.isRequired,
  rooms: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default RoomsList;
