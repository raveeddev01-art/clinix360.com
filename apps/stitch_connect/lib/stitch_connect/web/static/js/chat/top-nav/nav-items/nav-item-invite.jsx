import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import { TeamList } from "common/components";

@inject("groupStore", "presenceStore", "usersStore")
@observer
export default class NavItemInviteMembers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      members: ""
    };
  }

  saveUsers = () => {
    const { groupStore } = this.props;
    const groupUsers = groupStore.group.users;
    this.props.groupStore.inviteUsers(
      `${groupUsers.map(u => u.id).join(",")},${this.state.members}`
    );
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
    const { presenceStore, groupStore, usersStore } = this.props;
    const users = usersStore.users.filter(u => {
      return groupStore.group.users.findIndex(gu => gu.id === u.id) === -1;
    });

    return [
      <MenuItem key="members_menuitem" onClick={this.openModal}>
        Invite
      </MenuItem>,
      <Modal
        key="members_modal"
        show={this.state.showModal}
        onHide={this.closeModal}
      >
        <Modal.Header>
          <Modal.Title>Invite</Modal.Title>
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
            Select members to join the room.
          </TeamList>
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" onClick={this.closeModal}>
            Cancel
          </Button>
          <Button bsSize="large" bsStyle="primary" onClick={this.saveUsers}>
            Invite
          </Button>
        </Modal.Footer>
      </Modal>
    ];
  }
}
