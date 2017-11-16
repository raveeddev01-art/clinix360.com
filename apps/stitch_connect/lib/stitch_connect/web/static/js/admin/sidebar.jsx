import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Link, withRouter, matchPath } from "react-router-dom";
import ListGroup from "react-bootstrap/lib/ListGroup";
import ListGroupItem from "react-bootstrap/lib/ListGroupItem";

import { isAdmin } from "../util/utils";

@inject("teamStore", "presenceStore")
@observer
class Sidebar extends Component {
  _isSelected(path) {
    const { location } = this.props;

    return matchPath(location.pathname, { path, exact: true }) != null;
  }

  _adminTeamsOptions = () => {
    return (
      <div>
        <h3>Administration</h3>
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
          <ListGroupItem active={this._isSelected("/admin/users/members")}>
            <Link to="/admin/users/members">
              <i className="fa fa-users" /> Members
            </Link>
          </ListGroupItem>
          <ListGroupItem active={this._isSelected("/admin/users/invitations")}>
            <Link to="/admin/users/invitations">
              <i className="fa fa-envelope-o" /> Invitations
            </Link>
          </ListGroupItem>
          <ListGroupItem active={this._isSelected("/admin/users/pending")}>
            <Link to="/admin/users/pending">
              <i className="fa fa-inbox" /> Pending
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

  render() {
    const { onHideSidebar, teamStore } = this.props;

    return (
      <div className="sidebar">
        <div className="flex-header">
          <h4 className="team-name">{teamStore.name}</h4>
        </div>
        <div className="flex-container">
          <h3>You</h3>
          <ListGroup>
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

          <h3>Stitch</h3>
          <ListGroup>
            <ListGroupItem href="/">
              <i className="fa fa-rocket" /> Launch
            </ListGroupItem>
            <ListGroupItem href="#" onClick={this.props.presenceStore.lock}>
              <i className="fa fa-lock" /> Lockout
            </ListGroupItem>
            <ListGroupItem href="/logout">
              <i className="fa fa-sign-out" /> Sign Out
            </ListGroupItem>
          </ListGroup>
        </div>
      </div>
    );
  }
}

export default withRouter(Sidebar);
