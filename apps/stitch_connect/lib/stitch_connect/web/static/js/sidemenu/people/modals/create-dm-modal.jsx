import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import cx from "classnames";
import sortBy from "lodash/sortBy";
import { withRouter } from "react-router-dom";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import Select from "react-select";

@inject("usersStore", "presenceStore", "groupsStore")
@observer
class CreateDMModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.show,
      members: [],
      searchFilter: ""
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.props.show) {
      this.setState({ show: nextProps.show, members: [], searchFilter: "" });
    }
  }

  onChangeFilter = searchFilter => {
    this.setState({ searchFilter });
  };

  handleChange = value => {
    this.setState({ members: value });
  };

  canCreateDM = () => {
    const { members } = this.state;

    return members && members.length > 0;
  };

  createDM = () => {
    const { groupsStore, history, toggle } = this.props;
    const { members } = this.state;

    // TODO: DM group open/create steps
    // 1. Calculate slug from members selected
    // 2. Find if dm group already exists
    //  2.1. If exists, unhide
    //  2.2. If not, create

    const usernames = sortBy(members, "id")
      .map(user => user.username)
      .join(",");

    history.push(`/direct/${usernames}`);
    toggle();
  };

  selectUser = user => () => {
    const { history, toggle } = this.props;
    if (user.id === currentUser.id) {
      history.push(`/direct/${user.username}`);
      toggle();
      return;
    }

    this.setState({
      members: this.state.members.concat(
        Object.assign({}, user, {
          label: `${user.first_name} ${user.last_name}${user.id ===
          currentUser.id
            ? " (You)"
            : ""}`
        })
      )
    });
  };

  render() {
    const { searchFilter, members } = this.state;
    const { usersStore, presenceStore } = this.props;
    const users = usersStore.users.filter(u => {
      if (u.id === currentUser.id && members.length > 0) return false;
      return (
        members.findIndex(member => member.id === u.id) === -1 &&
        `${u.first_name} ${u.last_name}`
          .toLowerCase()
          .indexOf(searchFilter.toLowerCase()) > -1
      );
    });

    return (
      <Modal
        show={this.state.show}
        onEntered={() => this.selectComponent.focus()}
        onHide={this.props.toggle}
      >
        <Modal.Header>
          <Modal.Title>Direct Messages</Modal.Title>
          <a role="link" onClick={this.props.toggle}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          <div className="modal-search dm-modal-user-search">
            <Select
              ref={node => {
                this.selectComponent = node;
              }}
              multi
              valueKey="id"
              className="multi-select-large"
              onInputChange={this.onChangeFilter}
              onChange={this.handleChange}
              placeholder="Search"
              value={this.state.members}
            />
          </div>

          <h5 className="team-heading text-muted">
            Select members to start conversation with.
          </h5>

          <div className="team-list">
            {users.map(user => {
              const online = presenceStore.isOnline(user.id);
              const iconClasName = cx("fa", {
                "fa-circle": online,
                "fa-circle-o": !online
              });

              return (
                <div
                  role="link"
                  key={`team-list-${user.id}`}
                  className="team-member"
                  onClick={this.selectUser(user)}
                >
                  <i className={iconClasName} />
                  {` ${user.first_name} ${user.last_name}${user.id ===
                  currentUser.id
                    ? " (You)"
                    : ""}`}
                  <span className="text-muted">{user.username}</span>
                </div>
              );
            })}
          </div>
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
