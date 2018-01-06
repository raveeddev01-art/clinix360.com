import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Collapse from "react-bootstrap/lib/Collapse";
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar";
import Button from "react-bootstrap/lib/Button";
import { MEMBER_TYPE_OPTIONS } from "lib/constants";

@inject("usersStore")
@observer
class MemberItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  _toggleControls = () => {
    this.setState({ open: !this.state.open });
  };

  _activateUser = () => {
    const { usersStore, user } = this.props;
    const { hideAlert, onSuccess, onError } = this.props;

    hideAlert();
    usersStore
      .activateUser(user.id)
      .then(() => {
        onSuccess(`${user.full_name} has been activated.`);
      })
      .catch(err => {
        onError(err.data.message);
      });
  };

  _deactivateUser = () => {
    const { usersStore, user } = this.props;
    const { hideAlert, onSuccess, onError } = this.props;

    hideAlert();
    usersStore
      .deactivateUser(user.id)
      .then(() => {
        onSuccess(`${user.full_name} has been deactivated.`);
      })
      .catch(err => {
        onError(err.data.message);
      });
  };

  _promoteAdmin = () => {
    const { usersStore, user } = this.props;
    const { hideAlert, onSuccess, onError } = this.props;

    hideAlert();
    usersStore
      .promoteAdmin(user.id)
      .then(() => {
        onSuccess(`${user.full_name} has been promoted to admin.`);
      })
      .catch(err => {
        onError(err.data.message);
      });
  };

  _revokeAdmin = () => {
    const { usersStore, user } = this.props;
    const { hideAlert, onSuccess, onError } = this.props;

    hideAlert();
    usersStore
      .revokeAdmin(user.id)
      .then(() => {
        onSuccess(`${user.full_name}'s admin role has been revoked.`);
      })
      .catch(err => {
        onError(err.data.message);
      });
  };

  _startEditing = () => {
    const { usersStore, user } = this.props;
    usersStore.onStartEditing(user.id);
  };

  render() {
    const { user, online } = this.props;

    return (
      <div className="table-item">
        <Row>
          <Col xs={6} className="users-column">
            <div className="title">
              {online ? (
                <i className="fa fa-circle" />
              ) : (
                <i className="fa fa-circle-o" />
              )}
              <span className="name">{`${user.first_name} ${user.last_name}`}</span>{" "}
              <span className="username text-muted">{user.username}</span>
            </div>
            <div className="email text-muted">{user.email}</div>
          </Col>

          <Col xs={3} className="status-column text-center">
            {user.roles
              .map(
                r =>
                  (MEMBER_TYPE_OPTIONS.find(opt => opt.value === r) || {
                    label: r
                  }).label
              )
              .join(",")}
          </Col>

          <Col xs={3} className="actions-column text-right">
            <Button
              bsStyle="primary"
              onClick={this._toggleControls}
              disabled={user.id === currentUser.id}
            >
              Manage
            </Button>
          </Col>

          <div className="clearfix" />
          <Collapse in={this.state.open}>
            <ButtonToolbar className="actions-toolbar">
              {user.roles.indexOf("admin") === -1 && (
                <Button
                  bsSize="small"
                  className="m-r-10"
                  onClick={this._startEditing}
                >
                  Manage Member Type
                </Button>
              )}
              {!user.disabled &&
                (user.roles.indexOf("admin") > -1 ? (
                  <Button bsSize="small" onClick={this._revokeAdmin}>
                    Revoke Admin
                  </Button>
                ) : (
                  <Button bsSize="small" onClick={this._promoteAdmin}>
                    Promote Admin
                  </Button>
                ))}
              {user.disabled ? (
                <Button
                  onClick={this._activateUser}
                  bsSize="small"
                  className="pull-right"
                >
                  Enable Account
                </Button>
              ) : (
                <Button
                  onClick={this._deactivateUser}
                  bsSize="small"
                  className="pull-right"
                >
                  Disable Account
                </Button>
              )}
            </ButtonToolbar>
          </Collapse>
        </Row>
      </div>
    );
  }
}

MemberItem.propTypes = {
  user: PropTypes.object.isRequired,
  online: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default MemberItem;
