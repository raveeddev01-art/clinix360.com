import React, { Component } from "react";
import Navbar from "react-bootstrap/lib/Navbar";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";

class Header extends Component {
  render() {
    const logoLink = !window.electronApp ? `https://${applicationHost}` : "#";

    return (
      <Navbar id="header" inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <a href={logoLink} className="brand">
              <img src="/images/stitch-brand.png" alt="Stitch" />
            </a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <ul className="nav navbar-nav navbar-right">
            {!window.electronApp && (
              <li>
                <Dropdown id="products-dropdown-menu">
                  <Dropdown.Toggle className="btn-dropdown">
                    Products
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="products-menu">
                    <MenuItem href={`https://${applicationHost}/connect`}>
                      <div className="product-icon">
                        <img src="/images/connect-menu.png" alt="" />
                      </div>
                      Connect
                      <span>Team Messaging</span>
                    </MenuItem>
                    <MenuItem href={`https://${applicationHost}/engage`}>
                      <div className="product-icon">
                        <img src="/images/engage-menu.png" alt="" />
                      </div>
                      Engage
                      <span>Patient Messaging</span>
                    </MenuItem>
                    <MenuItem href={`https://${applicationHost}/manage`}>
                      <div className="product-icon">
                        <img src="/images/manage-menu.png" alt="" />
                      </div>
                      Manage
                      <span>Patient Management</span>
                    </MenuItem>
                  </Dropdown.Menu>
                </Dropdown>
              </li>
            )}

            {!window.electronApp && (
              <li role="presentation">
                <a
                  href={`https://${applicationHost}/pricing`}
                  className="nav-link"
                >
                  Pricing
                </a>
              </li>
            )}

            {!window.electronApp && (
              <li>
                <Dropdown id="resources-dropdown-menu">
                  <Dropdown.Toggle className="btn-dropdown">
                    Resources
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <MenuItem href={`https://${applicationHost}/downloads`}>
                      <i className="fa fa-cloud-download" /> Downloads
                    </MenuItem>

                    <MenuItem
                      href="https://calendly.com/teamstitch/demo"
                      target="_blank"
                    >
                      <i className="fa fa-desktop" /> Demo
                    </MenuItem>

                    <MenuItem
                      href="https://intercom.help/teamstitch"
                      target="_blank"
                    >
                      <i className="fa fa-life-ring" /> Support
                    </MenuItem>

                    <MenuItem href={`https://${applicationHost}/customers`}>
                      <i className="fa fa-users" /> Customers
                    </MenuItem>
                  </Dropdown.Menu>
                </Dropdown>
              </li>
            )}
            <li role="presentation">
              <a
                href={`https://${applicationHost}/signin`}
                className="nav-link"
              >
                Sign In
              </a>
            </li>

            <li role="presentation">
              <a
                href={`https://${applicationHost}/signup/email`}
                className="nav-link btn-outline"
              >
                Create Team
              </a>
            </li>
          </ul>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default Header;
