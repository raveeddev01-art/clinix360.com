import React, { Component } from "react";
import PropTypes from "prop-types";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import Room from "../room";
import RoomsModal from "./modals/rooms_modal";

class RoomsList extends Component {
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
    const { heading, rooms, sidemenuDiv } = this.props;

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

        {rooms.map(room => (
          <Room key={`room-${room.id}`} room={room} sidemenuDiv={sidemenuDiv} />
        ))}

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

RoomsList.defaultProps = {
  sidemenuDiv: null
};

RoomsList.propTypes = {
  heading: PropTypes.string.isRequired,
  rooms: PropTypes.arrayOf(PropTypes.object).isRequired,
  sidemenuDiv: PropTypes.object
};

export default RoomsList;
