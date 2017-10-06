import React, { Component } from "react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import Room from "../room";
import RoomsListModal from "./modals/rooms_list_modal";
import CreateGroupModal from "./modals/create_group_modal";

export default class RoomsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showRoomsListModal: false,
      showCreateGroupModal: false
    };
  }

  toggleRoomsListModal = () => {
    this.setState({
      showRoomsListModal: !this.state.showRoomsListModal
    });
  };

  toggleCreateGroupModal = () => {
    this.setState({
      showCreateGroupModal: !this.state.showCreateGroupModal
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
            <a role="button" onClick={this.toggleCreateGroupModal}>
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

        <CreateGroupModal
          showModal={this.state.showCreateGroupModal}
          toggleModal={this.toggleCreateGroupModal}
        />
      </div>
    );
  }
}
