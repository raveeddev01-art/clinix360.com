import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Link, withRouter, matchPath } from "react-router-dom";
import ListGroup from "react-bootstrap/lib/ListGroup";
import ListGroupItem from "react-bootstrap/lib/ListGroupItem";

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
            <Link to="/admin/team/settings"><i className="fa fa-cogs"></i> Settings</Link>
          </ListGroupItem>

          <ListGroupItem active={this._isSelected("/admin/team/security")}>
            <Link to="/admin/team/security"><i className="fa fa-shield"></i> Security</Link>
          </ListGroupItem>
          {/*<ListGroupItem active={this._isSelected("/admin/team/hipaa")}>
            <Link to="/admin/team/hipaa">HIPAA</Link>
          </ListGroupItem> */}
          {/* <ListGroupItem
            active={this._isSelected("/admin/team/export")}
          >
            <Link to="/admin/team/export">Export</Link>
          </ListGroupItem> */}
          <ListGroupItem
            active={this._isSelected("/admin/users/members")}
          >
            <Link to="/admin/users/members"><i className="fa fa-users"></i> Members</Link>
          </ListGroupItem>
          <ListGroupItem
            active={this._isSelected("/admin/users/invitations")}
          >
            <Link to="/admin/users/invitations"><i className="fa fa-envelope-o"></i> Invitations</Link>
          </ListGroupItem>
          <ListGroupItem
            active={this._isSelected("/admin/users/pending")}
          >
            <Link to="/admin/users/pending"><i className="fa fa-inbox"></i> Pending</Link>
          </ListGroupItem>
          <ListGroupItem
            active={this._isSelected("/admin/billing")}
          >
            <Link to="/admin/billing"><i className="fa fa-credit-card"></i> Billing</Link>
          </ListGroupItem>
        </ListGroup>
      </div>
    );
  };

  render() {
    const { teamStore } = this.props;

    return (
      <div className="sidebar">
        <div className="flex-header">
          <h4 className="team-name">{teamStore.name}</h4>
        </div>
        <div className="flex-container">
          <h3>You</h3>
          <ListGroup>
            <ListGroupItem
              active={this._isSelected("/admin/you/account")}
            >
              <Link to="/admin/you/account"><i className="fa fa-cog"></i> Account</Link>
            </ListGroupItem>
            <ListGroupItem
              active={this._isSelected("/admin/you/profile")}
            >
              <Link to="/admin/you/profile"><i className="fa fa-user"></i> Profile</Link>
            </ListGroupItem>
            <ListGroupItem
              active={this._isSelected("/admin/you/notifications")}
            >
              <Link to="/admin/you/notifications"><i className="fa fa-bell"></i> Notifications</Link>
            </ListGroupItem>
            <ListGroupItem>
              <Link to="https://teamstitch.zendesk.com/hc/en-us/categories/201817677-Connect" target="_blank"><i className="fa fa-question-circle"></i> Help <i className="fa fa-external-link sm"></i></Link>
            </ListGroupItem>
          </ListGroup>

          {currentUser.roles &&
            currentUser.roles.includes("admin") &&
            this._adminTeamsOptions()}

          <h3>Stitch</h3>
          <ListGroup>
            <ListGroupItem href="/">
              <i className="fa fa-rocket"></i> Launch
            </ListGroupItem>
            <ListGroupItem href="#" onClick={this.props.presenceStore.lock}>
              <i className="fa fa-lock"></i> Lockout
            </ListGroupItem>
            <ListGroupItem href="/logout">
              <i className="fa fa-sign-out"></i> Sign Out
            </ListGroupItem>
          </ListGroup>
        </div>
      </div>
    );
  }
}

export default withRouter(Sidebar);
