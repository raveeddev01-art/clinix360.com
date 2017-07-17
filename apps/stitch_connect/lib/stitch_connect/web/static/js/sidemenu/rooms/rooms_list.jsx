import React, { Component } from "react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import Room from "./room.jsx";

import sidemenuStore from "../sidemenu_store.js";

export default class RoomsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  toggleModal = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  render() {
    return (
      <div className="menu-nav m-b-20">
        <div className="heading">
          <h5>
            {this.props.heading}
          </h5>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="create-new-group">Create new group</Tooltip>}
          >
            <a href="#" onClick={this.toggleModal}>
              <i className="fa fa-plus" />
            </a>
          </OverlayTrigger>
        </div>

        {this.props.rooms.map(room => {
          return <Room key={`room-${room.id}`} room={room} />;
        })}

        <Modal
          className="sidemenu-modal"
          show={this.state.isOpen}
          onHide={this.toggleModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>Create Group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>Name</h5>
            <input type="text" className="form-control input-lg" />

            <h5>Members</h5>
            <input type="text" className="form-control input-lg" />
          </Modal.Body>

          <Modal.Footer>
            <Button bsSize="large" onClick={this.close}>
              Close
            </Button>
            <Button bsSize="large" bsStyle="primary" onClick={this.close}>
              Create Group
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
