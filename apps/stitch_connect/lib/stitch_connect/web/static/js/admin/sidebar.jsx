import React, { Component } from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";

import DropdownButton from "react-bootstrap/lib/DropdownButton";
import ListGroup from "react-bootstrap/lib/ListGroup";
import ListGroupItem from "react-bootstrap/lib/ListGroupItem";

@observer
export default class Sidebar extends Component {
  render() {
    return (
      <div id="sidebar">
        <h5 className="text-uppercase">Team</h5>
        <Link to="#">Settings</Link>
        <Link to="/admin/team/hipaa">HIPAA</Link>
        <Link to="#">Export</Link>
        <Link to="#">Federation</Link>

        <hr />

        <h5 className="text-uppercase">You</h5>
        <Link to="/admin/you/notifications">Notifications</Link>
      </div>
    );
  }
}
