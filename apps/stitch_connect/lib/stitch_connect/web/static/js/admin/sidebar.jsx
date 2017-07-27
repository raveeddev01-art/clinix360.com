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
        <ListGroup>
          <ListGroupItem>
            <Link to="/admin/team/settings">Settings</Link>
          </ListGroupItem>
          <ListGroupItem>
            <Link to="/admin/team/hipaa">HIPAA</Link>
          </ListGroupItem>
        </ListGroup>
      </div>
    );
  }
}
