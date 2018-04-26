import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import { TeamList } from "common/components";

import { isFullMember, getGroupUserIdsThatHasCurrentUser } from "lib/utils";

@inject("usersStore", "presenceStore", "groupsStore")
@observer
class CreateDMModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.show,
      members: "",
      searchFilter: ""
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.props.show) {
      this.setState({ show: nextProps.show, members: "" });
    }
  }

  handleChange = value => {
    this.setState({ members: value });
  };

  canCreateDM = () => {
    const { members } = this.state;

    return members && members.split(",").length > 0;
  };

  createDM = () => {
    const { groupsStore, toggle } = this.props;
    const { members } = this.state;

    const userIds = getGroupUserIdsThatHasCurrentUser(
      members.split(",").map(id => ({ id: id * 1 }))
    );

    groupsStore.goToDM(userIds);

    toggle();
  };

  selectUser = user => {
    if (user.id === currentUser.id) {
      this.setState(
        {
          members: `${user.id}`
        },
        () => {
          this.createDM();
        }
      );
    } else {
      this.setState({
        members: this.state.members
          ? `${this.state.members},${user.id}`
          : `${user.id}`
      });
    }
  };

  render() {
    const { members } = this.state;
    const { usersStore, presenceStore } = this.props;

    const users = isFullMember(currentUser)
      ? usersStore.nonBotUsers
      : usersStore.connectedUsers;

    return (
      <Modal show={this.state.show} onHide={this.props.toggle}>
        <Modal.Header>
          <Modal.Title>Direct Messages</Modal.Title>
          <a role="link" onClick={this.props.toggle}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          <TeamList
            onChange={this.handleChange}
            onSelectUser={this.selectUser}
            isOnline={presenceStore.isOnline}
            value={members}
            users={users}
            hideCurrentUser
            showDisabledAfter={1}
          >
            Select members to start conversation with.
          </TeamList>
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" onClick={this.props.toggle}>
            Cancel
          </Button>
          <Button
            bsSize="large"
            bsStyle="primary"
            onClick={this.createDM}
            disabled={!this.canCreateDM()}
          >
            Start Conversation
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

CreateDMModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired
};

CreateDMModal.defaultProp = {
  show: false,
  toggle: () => {}
};

export default CreateDMModal;
