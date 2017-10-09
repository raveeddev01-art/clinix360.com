import React, { Component } from "react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import Room from "../room";
import RoomsModal from "./modals/rooms_modal";
import RoomCreateModal from "./modals/room_create_modal";

export default class RoomsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: ""
    };
  }

  showRoomsListModal = () => {
    this.setState({
      modal: "list"
    });
  };

  showRoomCreateModal = () => {
    this.setState({
      modal: "create"
    });
  };

  closeModal = () => {
    this.setState({
      modal: ""
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
              <a role="button" onClick={this.showRoomsListModal}>
                {heading}
              </a>
            </OverlayTrigger>
          </h5>

          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="create-new-group">Create Room</Tooltip>}
          >
            <a role="button" onClick={this.showRoomCreateModal}>
              <i className="fa fa-plus-square-o" />
            </a>
          </OverlayTrigger>
        </div>

        {rooms.map(room => {
          return <Room key={`room-${room.id}`} room={room} />;
        })}

        <RoomsModal
          state={this.state.modal}
          showRoomsListModal={this.showRoomsListModal}
          showRoomCreateModal={this.showRoomCreateModal}
          closeModal={this.closeModal}
        />
      </div>
    );
  }
}
