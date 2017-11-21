import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { Link, withRouter, matchPath } from "react-router-dom";
import ListGroup from "react-bootstrap/lib/ListGroup";
import ListGroupItem from "react-bootstrap/lib/ListGroupItem";

import { isAdmin } from "../util/utils";
import InviteModal from "../common/modals/invite-modal";

@inject("teamStore", "presenceStore", "userStore")
@observer
class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showInviteModal: false
    };
  }

  _isSelected(path) {
    const { location } = this.props;

    return matchPath(location.pathname, { path, exact: true }) != null;
  }

  _adminTeamsOptions = () => {
    return (
      <div>
        <h5>Administration</h5>
        <ListGroup>
          <ListGroupItem
            active={
              this._isSelected("/admin/team/settings") ||
              this._isSelected("/admin/team")
            }
          >
            <Link to="/admin/team/settings">
              <i className="fa fa-cogs" /> Settings
            </Link>
          </ListGroupItem>
          <ListGroupItem active={this._isSelected("/admin/team/security")}>
            <Link to="/admin/team/security">
              <i className="fa fa-shield" /> Security
            </Link>
          </ListGroupItem>
          <ListGroupItem active={this._isSelected("/admin/analytics")}>
            <Link to="/admin/analytics">
              <i className="fa fa-bar-chart" /> Analytics
            </Link>
          </ListGroupItem>
          <ListGroupItem active={this._isSelected("/admin/members")}>
            <Link to="/admin/members">
              <i className="fa fa-users" /> Members
            </Link>
          </ListGroupItem>
          <ListGroupItem active={this._isSelected("/admin/billing")}>
            <Link to="/admin/billing">
              <i className="fa fa-credit-card" /> Billing
            </Link>
          </ListGroupItem>
        </ListGroup>
      </div>
    );
  };

  toggleInviteModal = () => {
    this.setState({
      showInviteModal: !this.state.showInviteModal
    });
  };

  showInviteModal = evt => {
    evt.preventDefault();
    this.toggleInviteModal();
  };

  render() {
    const { onHideSidebar, teamStore, userStore } = this.props;

    return (
      <div className="sidebar">
        <div className="flex-header">
          <h4 className="team-name">{teamStore.name}</h4>
        </div>
        <div className="flex-container">
          <h5>You</h5>
          <ListGroup>
            <ListGroupItem active={this._isSelected("/admin/you/home")}>
              <Link to="/admin/you/home">
                <i className="fa fa-home" /> Home
              </Link>
            </ListGroupItem>
            <ListGroupItem active={this._isSelected("/admin/you/account")}>
              <Link to="/admin/you/account">
                <i className="fa fa-cog" /> Account
              </Link>
            </ListGroupItem>
            <ListGroupItem active={this._isSelected("/admin/you/profile")}>
              <Link to="/admin/you/profile">
                <i className="fa fa-user" /> Profile
              </Link>
            </ListGroupItem>
            <ListGroupItem
              active={this._isSelected("/admin/you/notifications")}
            >
              <Link to="/admin/you/notifications">
                <i className="fa fa-bell" /> Notifications
              </Link>
            </ListGroupItem>
            <ListGroupItem onClick={onHideSidebar}>
              <Link to="https://intercom.help/teamstitch" target="_blank">
                <i className="fa fa-question-circle" /> Help{" "}
                <i className="fa fa-external-link sm" />
              </Link>
            </ListGroupItem>
          </ListGroup>

          {isAdmin() && this._adminTeamsOptions()}

          <h5>Stitch</h5>
          <ListGroup>
            {userStore.canInvite && (
              <ListGroupItem href="#" onClick={this.showInviteModal}>
                <i className="fa fa-envelope-o" /> Invite
              </ListGroupItem>
            )}
            <ListGroupItem href="#" onClick={this.props.presenceStore.lock}>
              <i className="fa fa-lock" /> Lockout
            </ListGroupItem>
            <ListGroupItem href="/logout">
              <i className="fa fa-sign-out" /> Sign Out
            </ListGroupItem>
          </ListGroup>

          <InviteModal
            show={this.state.showInviteModal}
            toggle={this.toggleInviteModal}
          />
        </div>
      </div>
    );
  }
}

Sidebar.propTypes = {
  onHideSidebar: PropTypes.func.isRequired
};

export default withRouter(Sidebar);
