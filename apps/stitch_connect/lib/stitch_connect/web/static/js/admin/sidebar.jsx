import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { Link, withRouter, matchPath } from "react-router-dom";
import ListGroup from "react-bootstrap/lib/ListGroup";
import ListGroupItem from "react-bootstrap/lib/ListGroupItem";

import { isAdmin } from "../lib/utils";
import InviteModal from "../common/modals/invite-modal";
import Scrollbar from "../common/components/scrollbar";

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
              <i className="fa fa-cogs" />
              <span>Settings</span>
            </Link>
          </ListGroupItem>
          <ListGroupItem active={this._isSelected("/admin/team/security")}>
            <Link to="/admin/team/security">
              <i className="fa fa-shield" />
              <span>Security</span>
            </Link>
          </ListGroupItem>
          <ListGroupItem active={this._isSelected("/admin/analytics")}>
            <Link to="/admin/analytics">
              <i className="fa fa-bar-chart" />
              <span>Analytics</span>
            </Link>
          </ListGroupItem>
          <ListGroupItem active={this._isSelected("/admin/members")}>
            <Link to="/admin/members">
              <i className="fa fa-users" />
              <span>Members</span>
            </Link>
          </ListGroupItem>
          <ListGroupItem active={this._isSelected("/admin/billing")}>
            <Link to="/admin/billing">
              <i className="fa fa-credit-card" />
              <span>Billing</span>
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
    const { teamStore, userStore } = this.props;

    return (
      <div className="sidebar">
        <div className="flex-header">
          <div className="team-user">
            <h4 className="team-name">{teamStore.name}</h4>
            <div className="user-name">
              <span className="user-name__status-icon">
                <i className="fa fa-circle" />
              </span>
              <span className="user-name__text">{userStore.fullName}</span>
            </div>
          </div>
        </div>
        <div className="flex-container">
          <Scrollbar
            className="scrollbar"
            viewRef={ref => {
              this.scrollbar = ref;
            }}
          >
            <h5 className="you-heading">You</h5>
            <ListGroup>
              <ListGroupItem active={this._isSelected("/admin/you/home")}>
                <Link to="/admin/you/home">
                  <i className="fa fa-home" />
                  <span>Home</span>
                </Link>
              </ListGroupItem>
              <ListGroupItem active={this._isSelected("/admin/you/account")}>
                <Link to="/admin/you/account">
                  <i className="fa fa-cog" />
                  <span>Account</span>
                </Link>
              </ListGroupItem>
              <ListGroupItem active={this._isSelected("/admin/you/profile")}>
                <Link to="/admin/you/profile">
                  <i className="fa fa-user" />
                  <span>Profile</span>
                </Link>
              </ListGroupItem>
              <ListGroupItem
                active={this._isSelected("/admin/you/notifications")}
              >
                <Link to="/admin/you/notifications">
                  <i className="fa fa-bell" />
                  <span>Notifications</span>
                </Link>
              </ListGroupItem>
              <ListGroupItem>
                <Link to="https://intercom.help/teamstitch" target="_blank">
                  <i className="fa fa-question-circle" />Help{" "}
                  <i className="fa fa-external-link sm" />
                </Link>
              </ListGroupItem>
            </ListGroup>

            {isAdmin() && this._adminTeamsOptions()}

            <h5>Stitch</h5>
            <ListGroup>
              {userStore.canInvite && (
                <ListGroupItem href="#" onClick={this.showInviteModal}>
                  <i className="fa fa-envelope-o" />
                  <span>Invite</span>
                </ListGroupItem>
              )}
              <ListGroupItem href="#" onClick={this.props.presenceStore.lock}>
                <i className="fa fa-lock" />
                <span>Lock Out</span>
              </ListGroupItem>
              <ListGroupItem href="/logout">
                <i className="fa fa-sign-out" />
                <span>Sign Out</span>
              </ListGroupItem>
            </ListGroup>

            <InviteModal
              show={this.state.showInviteModal}
              toggle={this.toggleInviteModal}
            />
          </Scrollbar>
        </div>
      </div>
    );
  }
}

export default withRouter(Sidebar);
