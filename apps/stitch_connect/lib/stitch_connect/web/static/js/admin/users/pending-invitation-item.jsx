import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { Row, Col, Button } from "react-bootstrap";
import { RoleText } from "common/components";

@inject("invitationStore")
@observer
class PendingInvitationItem extends Component {
  _revoke = () => {
    const { invitationStore, id, email } = this.props;
    const { hideAlert, onSuccess, onError } = this.props;

    hideAlert();
    invitationStore
      .revokeInvitation(id)
      .then(() => {
        onSuccess(`Invitation revoked from ${email}`);
      })
      .catch(err => {
        onError(err.data.message);
      });
  };

  _resend = () => {
    const { invitationStore, id, email } = this.props;
    const { hideAlert, onSuccess, onError } = this.props;

    hideAlert();
    invitationStore
      .resendInvitation(id)
      .then(() => {
        onSuccess(`Invitation resent to ${email}`);
      })
      .catch(err => {
        onError(err.data.message);
      });
  };

  render() {
    const { email, roles, groups } = this.props;

    return (
      <div className="table-item">
        <Row>
          <Col xs={5} className="email-column">
            {email}
          </Col>

          <Col xs={3} className="status-column text-center">
            <RoleText roles={roles} groups={groups} />
          </Col>

          <Col xs={4} className="text-center">
            <Button onClick={this._revoke}>Revoke</Button>
            <Button onClick={this._resend}>Resend</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

PendingInvitationItem.propTypes = {
  email: PropTypes.string.isRequired,
  roles: PropTypes.any.isRequired,
  groups: PropTypes.any.isRequired,
  id: PropTypes.number.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default PendingInvitationItem;
