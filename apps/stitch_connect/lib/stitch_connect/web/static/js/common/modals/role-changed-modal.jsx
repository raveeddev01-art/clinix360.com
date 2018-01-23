import React, { Component } from "react";
import { withRouter } from "react-router";
import { inject, observer } from "mobx-react";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import { RoleText } from "common/components";

@inject("userStore")
@observer
class RoleChangedModal extends Component {
  reload = () => {
    window.location.href = "/";
  };

  render() {
    const { roleChanged, roles } = this.props.userStore;
    return (
      <Modal show={roleChanged} onHide={this.reload} backdrop="static" keyboard>
        <Modal.Header>
          <Modal.Title>Reload Required</Modal.Title>
        </Modal.Header>
        <Modal.Body className="role-change-modal-body">
          <h5>
            Your account permissions has been changed. You are now&nbsp;
            <RoleText roles={roles} /> of the workspace. You must reload for the
            changes to take effect.
          </h5>
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" bsStyle="primary" onClick={this.reload}>
            Reload
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default withRouter(RoleChangedModal);
