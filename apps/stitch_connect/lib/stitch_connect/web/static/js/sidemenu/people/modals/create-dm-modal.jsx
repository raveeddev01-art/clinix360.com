import React, { Component, PropTypes } from "react";
import { observer, inject } from "mobx-react";
import cx from "classnames";
import { withRouter } from "react-router-dom";
import _ from "lodash";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import Members from "../../../common/components/members/members";

@inject("sidemenuStore", "presenceStore")
@observer
class CreateDMModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.show,
      members: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.props.show) {
      this.setState({ show: nextProps.show });
    }
  }

  handleChange = value => {
    this.setState({ members: value });
  };

  startDM = () => {
    const { history, toggle } = this.props;
    if (!this.state.members.length) {
      notify.show(`Choose people to start conversation with`, "error");
      return;
    }
    const usernames = this.state.members.map(user => user.username).join(",");

    history.push(`/direct/${usernames}`);
    toggle();
  };

  selectUser = user => () => {
    this.setState({ members: this.state.members.concat(user) });
  };

  render() {
    const users = _.differenceBy(
      this.props.sidemenuStore.users,
      this.state.members,
      "id"
    );

    return (
      <Modal className="sidemenu-modal" show={this.state.show}>
        <Modal.Header>
          <Modal.Title>People</Modal.Title>
          <a role="link" onClick={this.props.toggle}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          <div className="modal-search">
            <Members onChange={this.handleChange} value={this.state.members} />
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
                  {` ${user.first_name} ${user.last_name} `}
                  <span className="text-muted">
                    {user.username}
                  </span>
                </div>
              );
            })}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" onClick={this.props.toggle}>
            Cancel
          </Button>
          <Button bsSize="large" bsStyle="primary" onClick={this.startDM}>
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

export default withRouter(CreateDMModal);
