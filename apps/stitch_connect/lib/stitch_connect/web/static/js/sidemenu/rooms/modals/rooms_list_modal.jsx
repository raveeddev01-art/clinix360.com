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
      filteredRooms: [],
      filter: ""
    };
  }

  handleChange = event => {
    const { sidemenuStore } = this.props;
    const allRooms = sidemenuStore.groups;
    const { value } = event.target;
    const filteredRooms = allRooms.filter(room =>
      room.name.toLowerCase().startsWith(value.toLowerCase())
    );

    this.setState({
      filter: value,
      filteredRooms
    });
  };

  render() {
    const { sidemenuStore } = this.props;
    const { filteredRooms, filter } = this.state;
    const allRooms = sidemenuStore.groups;
    const rooms = filter !== "" ? filteredRooms : allRooms;

    return (
      <Modal className="sidemenu-modal" show={this.props.showModal}>
        <Modal.Header>
          <Modal.Title>Browse Rooms</Modal.Title>
          <a role="link" onClick={this.props.toggleModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          <input
            type="text"
            className="form-control input-lg m-b-20"
            placeholder="Search rooms"
            onChange={this.handleChange}
          />

          <h5 className="group-heading">Rooms you belong to:</h5>

          <div className="group-list">
            {rooms.map(room => (
              <RoomItem
                key={room.id}
                room={room}
                toggleModal={this.props.toggleModal}
              />
            ))}
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
