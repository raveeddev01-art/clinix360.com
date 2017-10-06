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
                      toggleModal={this.props.toggleModal}
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
                      toggleModal={this.props.toggleModal}
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
