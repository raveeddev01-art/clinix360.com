import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import { TeamList } from "common/components";

import {
  getGroupUserIdsThatHasCurrentUser,
  getSlugOfDMGroupByUsers,
  getGroupUrl
} from "lib/utils";

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
    const { groupsStore, history, toggle } = this.props;
    const { members } = this.state;

    // DM group open/create steps
    // 1. Calculate slug from members selected
    // 2. Find if dm group already exists
    //  2.1. If exists,
    //   2.1.1. If hidden, unhide
    //   2.1.2. If not hidden, do nothing
    //  2.2. If not, create
    // 3. Navigate to the dm created

    const userIds = getGroupUserIdsThatHasCurrentUser(
      members.split(",").map(id => ({ id: id * 1 }))
    );
    const slug = getSlugOfDMGroupByUsers(userIds);
    const group = groupsStore.getGroupBySlug(slug);

    let promise;

    if (!group) {
      // Create
      promise = groupsStore
        .createDMGroup(userIds)
        .then(resposne => resposne.data);
    } else if (group.is_hidden) {
      // Unhide
      promise = groupsStore.unhideGroup(group.id).then(() => group);
    } else {
      // Do nothing
      promise = Promise.resolve(group);
    }

    promise.then(groupCreated => {
      history.push(getGroupUrl(groupCreated));
    });

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
            users={usersStore.users.slice(0)}
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
  toggle: PropTypes.func.isRequired,
  history: PropTypes.any.isRequired
};

CreateDMModal.defaultProp = {
  show: false,
  toggle: () => {}
};

export default withRouter(CreateDMModal);
