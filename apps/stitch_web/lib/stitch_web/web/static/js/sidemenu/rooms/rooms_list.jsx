import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import { isFullMember } from "lib/utils";

import Modal from "react-bootstrap/lib/Modal";
import Room from "../room";
import SelectRoomModal from "./modals/rooms_modal";
import CreateRoomModal from "./modals/create_room_modal";

@inject("sidemenuStore")
@observer
class RoomsList extends Component {
  constructor(props) {
    super(props);
    this.state = { roomName: "" };
  }

  onCreateRoomClick = () => {
    this.showRoomCreateModal();
  };

  get currentModal() {
    return this.props.sidemenuStore.currentModal;
  }

  get isShowing() {
    return (
      this.currentModal === "list" ||
      this.currentModal === "create" ||
      this.currentModal === "search"
    );
  }

  showRoomsListModal = () => {
    this.props.sidemenuStore.setModal("list");
  };

  showRoomCreateModal = (roomName = "") => {
    this.setState({ roomName });
    this.props.sidemenuStore.setModal("create");
  };

  closeModal = () => {
    this.props.sidemenuStore.closeModal();
  };

  renderModalBody = () => {
    if (this.currentModal === "create") {
      return (
        <CreateRoomModal
          roomName={this.state.roomName}
          showRoomsListModal={this.showRoomsListModal}
          closeModal={this.closeModal}
        />
      );
    }
    return (
      <SelectRoomModal
        key={this.currentModal}
        currentModal={this.currentModal}
        showRoomCreateModal={this.showRoomCreateModal}
        closeModal={this.closeModal}
      />
    );
  };

  renderModal = () => {
    return (
      <Modal className="rooms-modal" show onHide={this.closeModal}>
        {this.renderModalBody()}
      </Modal>
    );
  };

  render() {
    const { heading, rooms } = this.props;

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
                <a
                  role="button"
                  className="create-room-button"
                  onClick={this.onCreateRoomClick}
                >
                  <i className="fa fa-plus-square-o" />
                </a>
              </OverlayTrigger>
            </div>
          )}
        </div>

        {rooms.map(room => <Room key={`room-${room.id}`} room={room} />)}

        {this.isShowing && this.renderModal()}
      </div>
    );
  }
}

RoomsList.propTypes = {
  heading: PropTypes.string.isRequired,
  rooms: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default RoomsList;
