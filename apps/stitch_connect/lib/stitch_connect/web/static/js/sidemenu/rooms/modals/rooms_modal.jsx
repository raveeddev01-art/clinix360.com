import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import Modal from "react-bootstrap/lib/Modal";

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

  render() {
    const {
      sidemenuStore,
      state,
      showRoomsListModal,
      showRoomCreateModal,
      closeModal
    } = this.props;
    const { filter } = this.state;
    const rooms = sidemenuStore.normalGroups.filter(room =>
      room.name.toLowerCase().startsWith(filter.toLowerCase())
    );
    const roomsJoined = rooms.filter(room => room.joined);
    const roomsNotJoined = rooms.filter(room => !room.joined);

    return (
      <Modal className="rooms-list-modal" show={!!state}>
        <Modal.Header>
          <Modal.Title>Browse Rooms</Modal.Title>
          <a role="link" onClick={closeModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

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
            {roomsNotJoined.length > 0 && (
              <div className="rooms-list">
                <h5 className="rooms-list-heading">Rooms you can join</h5>
                <div className="rooms-list-content">
                  {roomsNotJoined.map(room => (
                    <RoomItem
                      key={room.id}
                      room={room}
                      closeModal={closeModal}
                    />
                  ))}
                </div>
              </div>
            )}

            {roomsJoined.length > 0 && (
              <div className="rooms-list">
                <h5 className="rooms-list-heading">Rooms you belong to</h5>
                <div className="rooms-list-content">
                  {roomsJoined.map(room => (
                    <RoomItem
                      key={room.id}
                      room={room}
                      closeModal={closeModal}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
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
