import React, { Component, PropTypes } from "react";
import { observer, inject } from "mobx-react";
import cx from "classnames";
import _ from "lodash";
import { withRouter } from "react-router-dom";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import Select from "react-select";

@inject("sidemenuStore", "presenceStore")
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
    return members && members.length !== 0;
  };

  startDM = () => {
    const { history, toggle } = this.props;
    if (!this.state.members.length) {
      notify.show(`Choose people to start conversation with`, "error");
      return;
    }

    const members = this.state.members;
    members.push(currentUser);
    const usernames = _.sortBy(members, "id")
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
    const users = this.props.sidemenuStore.users.filter(u => {
      if (u.id === currentUser.id && members.length > 0) return false;
      return (
        members.findIndex(member => member.id === u.id) === -1 &&
        `${u.first_name} ${u.last_name}`
          .toLowerCase()
          .indexOf(searchFilter.toLowerCase()) > -1
      );
    });

    return (
      <Modal show={this.state.show}>
        <Modal.Header>
          <Modal.Title>Direct Messages</Modal.Title>
          <a role="link" onClick={this.props.toggle}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          <div className="modal-search dm-modal-user-search">
            <Select
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
              const online = this.props.presenceStore.isOnline(user.id);
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
            onClick={this.startDM}
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
