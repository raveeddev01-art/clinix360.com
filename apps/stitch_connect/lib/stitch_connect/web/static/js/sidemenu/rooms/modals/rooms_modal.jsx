import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";

import RoomItem from "./room_item";

@inject("sidemenuStore")
@observer
class RoomsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: ""
    };
  }

  handleChange = event => {
    const { value } = event.target;

    this.setState({
      filter: value
    });
  };

  filterRooms() {
    const { sidemenuStore } = this.props;
    const { filter } = this.state;
    const rooms = sidemenuStore.normalGroups.filter(room =>
      room.name.toLowerCase().startsWith(filter.toLowerCase())
    );

    return {
      joined: rooms.filter(room => room.joined),
      notJoined: rooms.filter(room => !room.joined)
    };
  }

  renderModalHeader() {
    const {
      state,
      showRoomsListModal,
      showRoomCreateModal,
      closeModal
    } = this.props;

    return (
      <Modal.Header>
        <Modal.Title>
          {state === "list" && "Browse Rooms"}
          {state === "create" && "Create Room"}
        </Modal.Title>
        {state === "list" && (
          <Button bsSize="xsmall" onClick={showRoomCreateModal}>
            Create Room
          </Button>
        )}
        {state === "create" && (
          <Button bsSize="xsmall" onClick={showRoomsListModal}>
            Browse Rooms
          </Button>
        )}
        <a role="link" onClick={closeModal}>
          <i className="fa fa-close" />
        </a>
      </Modal.Header>
    );
  }

  renderRoomsListModal() {
    const { closeModal } = this.props;
    const rooms = this.filterRooms();

    return (
      <Modal.Body>
        <div className="rooms-filter">
          <input
            type="text"
            className="form-control input-lg"
            placeholder="Find room"
            onChange={this.handleChange}
          />
        </div>

        <div className="rooms-filter-result">
          {rooms.notJoined.length > 0 && (
            <div className="rooms-list">
              <h5 className="rooms-list-heading">Rooms you can join</h5>
              <div className="rooms-list-content">
                {rooms.notJoined.map(room => (
                  <RoomItem key={room.id} room={room} closeModal={closeModal} />
                ))}
              </div>
            </div>
          )}

          {rooms.joined.length > 0 && (
            <div className="rooms-list">
              <h5 className="rooms-list-heading">Rooms you belong to</h5>
              <div className="rooms-list-content">
                {rooms.joined.map(room => (
                  <RoomItem key={room.id} room={room} closeModal={closeModal} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
    );
  }

  renderRoomCreateModal() {
    return <Modal.Body>Room create</Modal.Body>;
  }

  render() {
    const { state } = this.props;

    return (
      <Modal className="rooms-modal" show={!!state}>
        {this.renderModalHeader()}
        {state === "list" && this.renderRoomsListModal()}
        {state === "create" && this.renderRoomCreateModal()}
      </Modal>
    );
  }
}

RoomsModal.propTypes = {
  state: PropTypes.string.isRequired,
  showRoomsListModal: PropTypes.func.isRequired,
  showRoomCreateModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired
};

export default RoomsModal;
