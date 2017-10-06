import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import Modal from "react-bootstrap/lib/Modal";

import RoomItem from "./room_item";

@inject("sidemenuStore")
@observer
export default class GroupsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredGroups: [],
      filter: ""
    };
  }

  handleChange = event => {
    const { sidemenuStore } = this.props;
    const allGroups = sidemenuStore.groups;
    const { value } = event.target;
    const filteredGroups = allGroups.filter(group =>
      group.name.toLowerCase().startsWith(value.toLowerCase())
    );
    this.setState({
      filter: value,
      filteredGroups
    });
  };

  render() {
    const { sidemenuStore } = this.props;
    const { filteredGroups, filter } = this.state;
    const allGroups = sidemenuStore.groups;
    const groups = filter !== "" ? filteredGroups : allGroups;
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
            {groups.map(group => (
              <RoomItem
                key={group.id}
                room={group}
                toggleModal={this.props.toggleModal}
              />
            ))}
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
