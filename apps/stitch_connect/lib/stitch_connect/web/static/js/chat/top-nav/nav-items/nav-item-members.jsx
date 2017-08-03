import React, { Component } from "react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";

export default class NavItemMembers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  toggleModal = () => {
    this.setState({
      showModal: !this.state.showModal
    });
  };

  render() {
    return (
      <MenuItem onClick={this.toggleModal}>
        Members
        <Modal show={this.state.showModal} onHide={this.toggleModal}>
          <Modal.Header>
            <Modal.Title>Members</Modal.Title>
            <a href="#" onClick={this.toggleModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>

          <Modal.Body>Members</Modal.Body>

          <Modal.Footer>
            <Button bsSize="large" onClick={this.toggleModal}>
              Cancel
            </Button>
            <Button bsSize="large" bsStyle="primary">
              Done
            </Button>
          </Modal.Footer>
        </Modal>
      </MenuItem>
    );
  }
}
