import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { Row, Col, Collapse, ButtonToolbar, Button } from "react-bootstrap";
import AvatarEditPanel from "./avatar-edit-panel";

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

  render() {
    const { user, online, avatar } = this.props;
    const { hideAlert, onSuccess, onError } = this.props;

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
            {user.roles.join(",")}
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
            <div>
              <ButtonToolbar className="actions-toolbar">
                {/* <Button bsSize="small">Convert to Guest</Button> */}
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

              {avatar &&
                this.state.open && (
                  <AvatarEditPanel
                    user={user}
                    onSuccess={onSuccess}
                    onError={onError}
                    hideAlert={hideAlert}
                  />
                )}
            </div>
          </Collapse>
        </Row>
      </div>
    );
  }
}

MemberItem.propTypes = {
  user: PropTypes.object.isRequired,
  online: PropTypes.bool.isRequired,
  avatar: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default MemberItem;
