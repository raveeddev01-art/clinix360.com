import React, { Component } from "react";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
// import CreateTeamForm from "./create-team";
// import Navigation from "./navigation";

import Navbar from "react-bootstrap/lib/Navbar";
import Nav from "react-bootstrap/lib/Nav";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";

export default class Header extends Component {
  render() {
    return (
      <Navbar id="header" inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/" className="brand">
              <img src="/images/stitch-brand.png" alt="Stitch" />
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <ul className="nav navbar-nav navbar-right">
            <li>
              <Dropdown id="products-dropdown-menu">
                <Dropdown.Toggle className="btn-dropdown">
                  Products
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <LinkContainer to="/connect">
                    <MenuItem>Connect</MenuItem>
                  </LinkContainer>
                </Dropdown.Menu>
              </Dropdown>
            </li>

            <li role="presentation">
              <Link to="/pricing" className="nav-link">
                Pricing
              </Link>
            </li>

            <li>
              <Dropdown id="resources-dropdown-menu">
                <Dropdown.Toggle className="btn-dropdown">
                  Resources
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <LinkContainer to="/downloads">
                    <MenuItem>
                      <i className="fa fa-cloud-download" /> Downloads
                    </MenuItem>
                  </LinkContainer>

                  <MenuItem href="https://teamstitch.zendesk.com/hc/en-us">
                    <i className="fa fa-life-ring" /> Support
                  </MenuItem>
                </Dropdown.Menu>
              </Dropdown>
            </li>

            <li role="presentation">
              <a href="/signin" className="nav-link">
                Sign In
              </a>
            </li>

            <li role="presentation">
              <a href="/signup/email" className="nav-link">
                Create Team
              </a>
            </li>
          </ul>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
