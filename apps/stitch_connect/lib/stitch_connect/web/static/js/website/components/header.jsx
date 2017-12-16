import React, { Component } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";

import Navbar from "react-bootstrap/lib/Navbar";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";
import NavDropdown from "react-bootstrap/lib/NavDropdown";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import Button from "react-bootstrap/lib/Button";

class Header extends Component {
  render() {
    const logoLink = !window.electronApp ? `https://${applicationHost}` : "#";

    return (
      <Navbar id="header" inverse collapseOnSelect fixedTop>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/" className="brand">
              <img src="/images/stitch-brand.png" alt="Stitch" />
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>

        <Navbar.Collapse>
          <Nav pullRight>
            <LinkContainer to="/demo">
              <NavItem>Demo</NavItem>
            </LinkContainer>

            <NavDropdown title="Products" id="products-dropdown">
              <LinkContainer to="/connect">
                <MenuItem>
                  <div className="product-icon">
                    <img src="/images/connect-menu.png" alt="" />
                  </div>
                  Connect <div className="subtext">Team Communication</div>
                </MenuItem>
              </LinkContainer>

              <LinkContainer to="/engage">
                <MenuItem>
                  <div className="product-icon">
                    <img src="/images/engage-menu.png" alt="" />
                  </div>
                  Engage <div className="subtext">Patient Management</div>
                </MenuItem>
              </LinkContainer>

              <LinkContainer to="/manage">
                <MenuItem>
                  <div className="product-icon">
                    <img src="/images/manage-menu.png" alt="" />
                  </div>
                  Manage <div className="subtext">Patient Communication</div>
                </MenuItem>
              </LinkContainer>
            </NavDropdown>

            <LinkContainer to="/pricing">
              <NavItem>Pricing</NavItem>
            </LinkContainer>

            <NavDropdown title="Resources" id="resources-dropdown">
              <LinkContainer to="/downloads">
                <MenuItem>
                  <i className="fa fa-cloud-download" /> Downloads
                  <div className="subtext hidden-sm hidden-lg">
                    Apps for Mac, Windows, iOS and Android
                  </div>
                </MenuItem>
              </LinkContainer>

              <LinkContainer to="/pilot">
                <MenuItem>
                  <i className="fa fa-hospital-o" /> Pilot
                  <div className="subtext hidden-sm hidden-lg">
                    Enterprise grade deployment plans
                  </div>
                </MenuItem>
              </LinkContainer>

              <MenuItem href="https://intercom.help/teamstitch">
                <i className="fa fa-life-ring" /> Help Center
                <div className="subtext hidden-sm hidden-lg">
                  Everything you need to be a Stitch power user
                </div>
              </MenuItem>

              <MenuItem href={`https://${applicationHost}/jobs`}>
                <i className="fa fa-wrench" /> Jobs
                <div className="subtext hidden-sm hidden-lg">We're hiring!</div>
              </MenuItem>

              <LinkContainer to="/customers">
                <MenuItem>
                  <i className="fa fa-users" /> Customers
                  <div className="subtext hidden-sm hidden-lg">
                    Everything you need to be a Stitch power user
                  </div>
                </MenuItem>
              </LinkContainer>

              <LinkContainer to="/blog">
                <MenuItem>
                  <i className="fa fa-book" /> Blog
                  <div className="subtext hidden-sm hidden-lg">
                    To be changed
                  </div>
                </MenuItem>
              </LinkContainer>
            </NavDropdown>

            <NavItem href="https://teamstitch.com/signin">Sign In</NavItem>

            <NavItem
              href="https://teamstitch.com/signup/email"
              className="btn-trial"
            >
              Start a trial
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default Header;
