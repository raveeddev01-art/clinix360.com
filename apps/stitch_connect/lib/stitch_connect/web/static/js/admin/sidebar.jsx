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
      <div id="sidebar">
        <ListGroup>
          <ListGroupItem 
            active={isSelected(this.context, "/admin/team/settings")}
          >
            <Link to="/admin/team/settings">Settings</Link>
          </ListGroupItem>
          <ListGroupItem
            active={isSelected(this.context, "/admin/team/hipaa")}
          >
            <Link to="/admin/team/hipaa">HIPAA</Link>
          </ListGroupItem>
        </ListGroup>
      </div>
    );
  }
}

Sidebar.contextTypes = {
  router: React.PropTypes.object.isRequired
};