import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import Modal from "react-bootstrap/lib/Modal";

import RoomItem from "./room_item";

@inject("sidemenuStore")
@observer
export default class RoomsListModal extends Component {
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
    const { sidemenuStore } = this.props;
    const { filter } = this.state;
    const rooms = sidemenuStore.normalGroups.filter(room =>
      room.name.toLowerCase().startsWith(filter.toLowerCase())
    );
    const roomsJoined = rooms.filter(room => room.joined);
    const roomsNotJoined = rooms.filter(room => !room.joined);

    return (
      <Modal className="rooms-list-modal" show={this.props.showModal}>
        <Modal.Header>
          <Modal.Title>Browse Rooms</Modal.Title>
          <a role="link" onClick={this.props.toggleModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          <input
            type="text"
            className="form-control input-lg"
            placeholder="Search rooms"
            onChange={this.handleChange}
          />

          {roomsJoined.length > 0 && (
            <div className="rooms-joined m-b-20">
              <h5 className="room-heading">Rooms you belong to</h5>
              <div className="room-list">
                {roomsJoined.map(room => (
                  <RoomItem
                    key={room.id}
                    room={room}
                    toggleModal={this.props.toggleModal}
                  />
                ))}
              </div>
            </div>
          )}

          {roomsNotJoined.length > 0 && (
            <div className="rooms-not-joined m-b-20">
              <h5 className="room-heading">Rooms you can join</h5>
              <div className="room-list">
                {roomsNotJoined.map(room => (
                  <RoomItem
                    key={room.id}
                    room={room}
                    toggleModal={this.props.toggleModal}
                  />
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    );
  }
}
