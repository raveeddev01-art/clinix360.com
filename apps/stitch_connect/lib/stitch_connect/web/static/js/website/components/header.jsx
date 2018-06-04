import React, { Component } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import cx from "classnames";

import Navbar from "react-bootstrap/lib/Navbar";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";
import NavDropdown from "react-bootstrap/lib/NavDropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";

import browserDetails from "../../lib/browser_details";

function noop() {}

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mobileNavOpened: false,
      productsMenuOpened: false,
      resourcesMenuOpened: false,
      mobileProductsMenu: false
    };
  }

  goToSignIn() {
    window.location.href = `https://${applicationHost}/signin`;
  }

  goToGetStarted() {
    window.location.href = `https://${applicationHost}/getstarted`;
  }

  toggleProductsMenu = () => {
    this.setState({
      productsMenuOpened: !this.state.productsMenuOpened
    });
  };

  toggleResourcesMenu = () => {
    this.setState({
      resourcesMenuOpened: !this.state.resourcesMenuOpened
    });
  };

  mobileNavToggle = () => {
    this.setState({
      mobileNavOpened: !this.state.mobileNavOpened
    });

    const html = document.getElementsByTagName("html")[0];

    if (this.state.mobileNavOpened === true) {
      html.classList.remove("mobile-menu-open");
    } else {
      html.classList.add("mobile-menu-open");
    }
  };

  render() {
    const { mobile, os } = browserDetails;

    const mobileNavClasses = cx("navbar navbar-default", {
      "is-open": this.state.mobileNavOpened === true,
      "is-hidden": this.state.mobileNavOpened === false
    });

    return (
      <div>
        <Navbar id="header" inverse fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/" className="brand">
                <img src="/images/stitch-brand.svg" alt="Stitch" />
              </Link>
            </Navbar.Brand>
            <Navbar.Toggle onClick={this.mobileNavToggle} />
          </Navbar.Header>
          <Nav pullRight>
            <NavDropdown
              title="Products"
              id="products-dropdown"
              onMouseEnter={this.toggleProductsMenu}
              onMouseLeave={this.toggleProductsMenu}
              onToggle={noop}
              open={this.state.productsMenuOpened}
              noCaret
            >
              <LinkContainer to="/connect">
                <MenuItem>
                  <i className="fa fa-comments" />
                  Connect <div className="subtext">Team messaging</div>
                </MenuItem>
              </LinkContainer>

              <LinkContainer to="/engage">
                <MenuItem>
                  <i className="fa fa-bullhorn" />
                  Engage <div className="subtext">Patient communication</div>
                </MenuItem>
              </LinkContainer>

              <LinkContainer to="/manage">
                <MenuItem>
                  <i className="fa fa-tasks" />
                  Manage <div className="subtext">Task management</div>
                </MenuItem>
              </LinkContainer>
            </NavDropdown>

            <LinkContainer to="/pricing">
              <NavItem>Pricing</NavItem>
            </LinkContainer>

            <NavDropdown
              title="Resources"
              id="resources-dropdown"
              onMouseEnter={this.toggleResourcesMenu}
              onMouseLeave={this.toggleResourcesMenu}
              onToggle={noop}
              open={this.state.resourcesMenuOpened}
              noCaret
            >
              <LinkContainer to="/downloads">
                <MenuItem>
                  <i className="fa fa-cloud-download" /> Downloads
                </MenuItem>
              </LinkContainer>

              <LinkContainer to="/customers">
                <MenuItem>
                  <i className="fa fa-users" /> Customers
                </MenuItem>
              </LinkContainer>

              <MenuItem
                href="https://intercom.help/teamstitch"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa fa-life-ring" /> Help Center
              </MenuItem>

              <MenuItem href={`https://${applicationHost}/jobs`}>
                <i className="fa fa-wrench" /> Jobs
              </MenuItem>

              <MenuItem
                href="https://medium.com/stitch-health"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa fa-book" /> Blog
              </MenuItem>
            </NavDropdown>

            <NavItem onClick={this.goToSignIn}>Sign In</NavItem>

            <NavItem onClick={this.goToGetStarted} className="btn-trial">
              Get Started
            </NavItem>
          </Nav>
        </Navbar>

        <nav id="mobile-nav" className={mobileNavClasses}>
          <div className="header">
            <div className="container">
              <Link className="brand" to="/">
                <img src="/images/stitch-brand-alt.svg" alt="Stitch" />
              </Link>

              <a className="close-menu" onClick={this.mobileNavToggle}>
                <i className="fa fa-close" />
              </a>
            </div>
          </div>

          <Navbar collapseOnSelect onSelect={this.mobileNavToggle}>
            <Nav>
              <NavDropdown title="Products" id="products-dropdown">
                <LinkContainer to="/connect">
                  <MenuItem>
                    <i className="fa fa-comments" />
                    Connect
                  </MenuItem>
                </LinkContainer>

                <LinkContainer to="/engage">
                  <MenuItem>
                    <i className="fa fa-bullhorn" />
                    Engage
                  </MenuItem>
                </LinkContainer>

                <LinkContainer to="/manage">
                  <MenuItem>
                    <i className="fa fa-tasks" />
                    Manage
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
                  </MenuItem>
                </LinkContainer>

                <MenuItem
                  href="https://intercom.help/teamstitch"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa fa-life-ring" /> Help Center
                </MenuItem>

                <MenuItem href={`https://${applicationHost}/jobs`}>
                  <i className="fa fa-wrench" /> Jobs
                </MenuItem>

                <LinkContainer to="/customers">
                  <MenuItem>
                    <i className="fa fa-users" /> Customers
                  </MenuItem>
                </LinkContainer>

                <MenuItem
                  href="https://medium.com/stitch-health"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa fa-book" /> Blog
                </MenuItem>
              </NavDropdown>

              <NavItem onClick={this.goToSignIn}>Sign In</NavItem>
              {!mobile && (
                <NavItem onClick={this.goToGetStarted} className="btn-trial">
                  Get Started
                </NavItem>
              )}

              {mobile &&
                os === "iOS" && (
                  <NavItem
                    href="http://stitch.app.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="appstore-btn"
                  >
                    Get Stitch for iOS
                  </NavItem>
                )}

              {mobile &&
                os === "Android" && (
                  <NavItem
                    href="http://stitch.app.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="appstore-btn"
                  >
                    Get Stitch for Android
                  </NavItem>
                )}
            </Nav>
          </Navbar>
        </nav>
      </div>
    );
  }
}

export default Header;
