import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import { TeamList } from "common/components";
import { isFullMember } from "lib/utils";

const fullMemberNotSelf = u => {
  return isFullMember(u) && u.id !== currentUser.id;
};

@inject("groupStore", "presenceStore")
@observer
export default class NavItemRemoveMembers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      members: ""
    };
  }

  saveUsers = () => {
    const { groupStore } = this.props;
    const removeMemeberIds = this.state.members
      .split(",")
      .map(n => parseInt(n, 10));

    groupStore.removeUsers(removeMemeberIds);

    this.setState({ showModal: false });
  };

  openModal = () => {
    this.setState({ showModal: true, members: "" });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  handleChange = value => {
    this.setState({ members: value });
  };

  selectUser = user => {
    this.setState({
      members: this.state.members
        ? `${this.state.members},${user.id}`
        : `${user.id}`
    });
  };

  render() {
    const { presenceStore, groupStore } = this.props;
    const users = groupStore.group.users.filter(fullMemberNotSelf);

    return [
      <MenuItem key="members_menuitem" onClick={this.openModal}>
        Remove Members from Room
      </MenuItem>,
      <Modal
        key="members_modal"
        show={this.state.showModal}
        onHide={this.closeModal}
      >
        <Modal.Header>
          <Modal.Title>Remove Members from Room</Modal.Title>
          <a role="link" onClick={this.closeModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>
        <Modal.Body>
          <TeamList
            onChange={this.handleChange}
            onSelectUser={this.selectUser}
            value={this.state.members}
            isOnline={presenceStore.isOnline}
            users={users}
          >
            Select members to remove from the room.
          </TeamList>
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" onClick={this.closeModal}>
            Cancel
          </Button>
          <Button bsSize="large" bsStyle="primary" onClick={this.saveUsers}>
            Remove
          </Button>
        </Modal.Footer>
      </Modal>
    ];
  }
}
