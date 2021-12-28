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

  toggleCarespacesMenu = () => {
    this.setState({
      carespacesMenuOpened: !this.state.carespacesMenuOpened
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

  renderYourCarespaces(teams, inSmallMenu) {
    const navProps = inSmallMenu
      ? {}
      : {
          open: this.state.carespacesMenuOpened,
          onMouseEnter: this.toggleCarespacesMenu,
          onMouseLeave: this.toggleCarespacesMenu,
          onToggle: noop,
          noCaret: true
        };

    return (
      <NavDropdown
        title="Your Carespaces"
        id="yourcarespaces-dropdown"
        {...navProps}
      >
        {teams.map(team => (
          <MenuItem
            href={`https://${team.slug}.${applicationHost}/`}
            key={team.slug}
          >
            {team.name}
          </MenuItem>
        ))}
      </NavDropdown>
    );
  }

  render() {
    const { mobile, os } = browserDetails;

    const mobileNavClasses = cx("navbar navbar-default", {
      "is-open": this.state.mobileNavOpened === true,
      "is-hidden": this.state.mobileNavOpened === false
    });

    const blueNav = cx({
      blueNav: this.props.blueNav
    });

    const hasLogins = appSettings.hasLogin;

    return (
      <div>
        <Navbar id="header" inverse fixedTop className={blueNav}>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/" className="brand">
                {this.props.blueNav ? (
                  <img src="/images/stitch-brand-alt.svg" alt="InvoChat" />
                ) : (
                  <img src="/images/stitch-brand.svg" alt="InvoChat" />
                )}
              </Link>
            </Navbar.Brand>
            <Navbar.Toggle onClick={this.mobileNavToggle} />
          </Navbar.Header>
          <Nav pullRight>
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
                  <i className="far fa-cloud-download" /> Downloads
                </MenuItem>
              </LinkContainer>

              <LinkContainer to="/customers">
                <MenuItem>
                  <i className="far fa-users" /> Customers
                </MenuItem>
              </LinkContainer>

              <MenuItem
                href="https://help.dvlcloud.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="far fa-life-ring" /> Help Center
              </MenuItem>

              <MenuItem
                href="https://medium.com/stitch-health"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="far fa-book" /> Blog
              </MenuItem>
            </NavDropdown>

            <NavItem onClick={this.goToSignIn}>Sign In</NavItem>

            {hasLogins && this.renderYourCarespaces(appSettings.teams, false)}

            {!hasLogins && <NavItem className="btn-request-info" href="mailto:feedback@dvlcloud.com?subject=Stitch: Request Information">Request Information</NavItem>}
          </Nav>
        </Navbar>

        <nav id="mobile-nav" className={mobileNavClasses}>
          <div className="header">
            <div className="container">
              <Link className="brand" to="/">
                <img src="/images/stitch-brand-alt.svg" alt="InvoChat" />
              </Link>

              <a className="close-menu" onClick={this.mobileNavToggle}>
                <i className="far fa-close" />
              </a>
            </div>
          </div>

          <Navbar collapseOnSelect onSelect={this.mobileNavToggle}>
            <Nav>
              <LinkContainer to="/pricing">
                <NavItem>Pricing</NavItem>
              </LinkContainer>

              <NavDropdown title="Resources" id="resources-dropdown">
                <LinkContainer to="/downloads">
                  <MenuItem>
                    <i className="far fa-cloud-download" /> Downloads
                  </MenuItem>
                </LinkContainer>

                <MenuItem
                  href="https://help.dvlcloud.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="far fa-life-ring" /> Help Center
                </MenuItem>

                <MenuItem href={`https://${applicationHost}/jobs`}>
                  <i className="far fa-wrench" /> Jobs
                </MenuItem>

                <LinkContainer to="/customers">
                  <MenuItem>
                    <i className="far fa-users" /> Customers
                  </MenuItem>
                </LinkContainer>

                <MenuItem
                  href="https://medium.com/stitch-health"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="far fa-book" /> Blog
                </MenuItem>
              </NavDropdown>

              <NavItem onClick={this.goToSignIn}>Sign In</NavItem>

              {!mobile &&
                (hasLogins &&
                  this.renderYourCarespaces(appSettings.teams, true))}

              {mobile &&
                hasLogins &&
                this.renderYourCarespaces(appSettings.teams, true)}

              {mobile && !hasLogins && <NavItem className="btn-request-info" href="mailto:feedback@dvlcloud.com?subject=Stitch: Request Information">Request Information</NavItem>}

              {mobile &&
                os === "iOS" && (
                  <NavItem
                    href="http://stitch.app.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="appstore-btn"
                  >
                    Get InvoChat for iOS
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
                    Get InvoChat for Android
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
