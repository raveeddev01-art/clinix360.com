import React, { Component } from "react";
import * as mobx from "mobx";
import { inject, observer } from "mobx-react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import Members from "../../../common/components/members/members";

@inject("groupStore")
@observer
export default class NavItemMembers extends Component {
  constructor(props) {
    super(props);

    const { groupStore } = props;

    this.state = {
      showModal: false,
      members: mobx.toJS(groupStore.group.users)
    };
  }

  saveUsers = () => {
    const { groupStore } = this.props;

    groupStore.saveUsers(this.state.members);

    this.setState({ showModal: false });
  };

  openModal = () => {
    this.setState({ showModal: true });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  handleChange = value => {
    this.setState({ members: value });
  };

  render() {
    return [
      <MenuItem key="members_menuitem" onClick={this.openModal}>
        Members
      </MenuItem>,
      <Modal
        key="members_modal"
        show={this.state.showModal}
        onHide={this.closeModal}
      >
        <Modal.Header>
          <Modal.Title>Members</Modal.Title>
          <a role="link" onClick={this.closeModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>
        <Modal.Body>
          <h5>Select users to invite to this room.</h5>
          <Members onChange={this.handleChange} value={this.state.members} />
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" onClick={this.closeModal}>
            Cancel
          </Button>
          <Button bsSize="large" bsStyle="primary" onClick={this.saveUsers}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    ];
  }
}
