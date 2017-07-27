import React, { Component } from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";

import DropdownButton from "react-bootstrap/lib/DropdownButton";
import ListGroup from "react-bootstrap/lib/ListGroup";
import ListGroupItem from "react-bootstrap/lib/ListGroupItem";

import isSelected from "../util/active_styling.jsx";

export default class Sidebar extends Component {
  render() {
    return (
      <div id="sidebar" className="panel panel-default">
        <h3>Team</h3>
        <ListGroup>
          <ListGroupItem
            active={
              isSelected(this.context, "/admin/team/settings") ||
              isSelected(this.context, "/admin/team")
            }
          >
            <Link to="/admin/team/settings">Settings</Link>
          </ListGroupItem>
          <ListGroupItem active={isSelected(this.context, "/admin/team/hipaa")}>
            <Link to="/admin/team/hipaa">HIPAA</Link>
          </ListGroupItem>
          <ListGroupItem
            active={isSelected(this.context, "/admin/team/export")}
          >
            <Link to="/admin/team/export">Export</Link>
          </ListGroupItem>
        </ListGroup>

        <hr />
        <h3>You</h3>
        <ListGroup>
          <ListGroupItem
            active={isSelected(this.context, "/admin/you/notifications")}
          >
            <Link to="/admin/you/notifications">Notifications</Link>
          </ListGroupItem>
        </ListGroup>

        <hr />
        <h3>Users</h3>
        <ListGroup>
          <ListGroupItem
            active={isSelected(this.context, "/admin/users/invitations")}
          >
            <Link to="/admin/users/invitations">Invitations</Link>
          </ListGroupItem>
        </ListGroup>
      </div>
    );
  }
}

Sidebar.contextTypes = {
  router: React.PropTypes.object.isRequired
};
