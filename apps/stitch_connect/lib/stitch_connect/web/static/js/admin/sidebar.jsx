import React, { Component } from "react";
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
            <ListGroupItem href="#" active>Settings</ListGroupItem>
            <ListGroupItem href="#">Hippa</ListGroupItem>
          </ListGroup>
      </div>
    );
  }
}
