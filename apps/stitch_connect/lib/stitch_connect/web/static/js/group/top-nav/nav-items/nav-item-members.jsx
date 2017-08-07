import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import Members from "../../../common/components/members/members.jsx";

@inject("groupStore")
@observer
export default class NavItemMembers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      members: ""
    };
  }

  _saveUsers = () => {
    this.props.groupStore.saveUsers(this.state.members);
    this.setState({ showModal: false });
  };

  _toggleModal = () => {
    if (!this.state.showModal) {
      this.props.groupStore.loadUsers().then(members => {
        this.setState({ members });
      });
    }

    this.setState({
      showModal: !this.state.showModal
    });
  };

  _handleChange = value => {
    this.setState({ members: value });
  };

  render() {
    return (
      <MenuItem onClick={this._toggleModal}>
        Members
        <Modal show={this.state.showModal} onHide={this._toggleModal}>
          <Modal.Header>
            <Modal.Title>Members</Modal.Title>
            <a href="#" onClick={this._toggleModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>
          <Modal.Body>
            <h5>Select users to invite to this group.</h5>
            <Members onChange={this._handleChange} value={this.state.members} />
          </Modal.Body>
          <Modal.Footer>
            <Button bsSize="large" onClick={this._toggleModal}>
              Cancel
            </Button>
            <Button bsSize="large" bsStyle="primary" onClick={this._saveUsers}>
              Done
            </Button>
          </Modal.Footer>
        </Modal>
      </MenuItem>
    );
  }
}
