import React, { Component } from "react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import Room from "../room";
import RoomsListModal from "./modals/rooms_list_modal";
import RoomCreateModal from "./modals/room_create_modal";

export default class RoomsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showRoomsListModal: false,
      showRoomCreateModal: false
    };
  }

  toggleRoomsListModal = () => {
    this.setState({
      showRoomsListModal: !this.state.showRoomsListModal
    });
  };

  toggleRoomCreateModal = () => {
    this.setState({
      showRoomCreateModal: !this.state.showRoomCreateModal
    });
  };

  render() {
    const { heading, rooms } = this.props;

    return (
      <div className="menu-nav m-b-20">
        <div className="heading">
          <h5>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="browse-rooms">Browse Rooms</Tooltip>}
            >
              <a role="button" onClick={this.toggleRoomsListModal}>
                {heading}
              </a>
            </OverlayTrigger>
          </h5>

          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="create-new-group">Create Room</Tooltip>}
          >
            <a role="button" onClick={this.toggleRoomCreateModal}>
              <i className="fa fa-plus-square-o" />
            </a>
          </OverlayTrigger>
        </div>

        {rooms.map(room => {
          return <Room key={`room-${room.id}`} room={room} />;
        })}

        <RoomsListModal
          showModal={this.state.showRoomsListModal}
          toggleModal={this.toggleRoomsListModal}
        />

        <RoomCreateModal
          showModal={this.state.showRoomCreateModal}
          toggleModal={this.toggleRoomCreateModal}
        />
      </div>
    );
  }
}
