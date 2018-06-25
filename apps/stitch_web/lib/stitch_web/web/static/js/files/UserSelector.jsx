import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";
import { Grid, Row, Col, FormGroup, ControlLabel, DropdownButton, MenuItem, } from "react-bootstrap";
import { Typeahead } from 'react-bootstrap-typeahead';

const UserSelector = ({ users, onSelect }) =>
  <Typeahead
    labelKey="full_name"
    multiple={false}
    options={users}
    onChange={selected => {
      if (selected.length == 0) {
        onSelect(null);
      } else {
        onSelect(selected[0].id);
      }
    }}
    renderMenuItemChildren={(user) => (
      <div className=".user-list-item" key={user.id}>
        <div className="item-text" style={{ flexGrow: 1, display: "flex" }}>
          <div className="avatar">
            <img className="img-circle" src={user.avatar_thumb} style={{ width: "20px", height: "20px" }} />
          </div>
          <span className="username">{user.full_name}</span>
          <span className="text-muted">{user.username}</span>
        </div>
      </div>
    )}
    placeholder="Search by name" />

export default UserSelector;
