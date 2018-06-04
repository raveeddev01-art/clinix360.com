import React, { Component } from "react";
import PropTypes from "prop-types";

import Nav from "react-bootstrap/lib/Nav";
import Navbar from "react-bootstrap/lib/Navbar";
import NavItem from "react-bootstrap/lib/NavItem";

import browserDetails from "../../../lib/browser_details";

function goToPath(path) {
  window.location.href = `https://${applicationHost}/${path}`;
}

class AuthenticationHeader extends Component {
  goToFindTeam() {
    goToPath("find-your-team");
  }

  goToSignIn() {
    goToPath("signin");
  }

  goToCreate() {
    goToPath("signup/email");
  }

  renderBrand() {
    if (window.electronApp) {
      return <img src="/images/stitch-brand.png" alt="Stitch" />;
    }

    return (
      <a href={`https://${applicationHost}/`} className="brand">
        <img src="/images/stitch-brand.png" alt="Stitch" />
      </a>
    );
  }

  renderCTA() {
    const { mobile } = browserDetails;

    if (mobile || this.props.type === "no-cta") {
      return null;
    }

    if (this.props.type === "signin") {
      return [
        <Navbar.Text key="nav-text">Already part of a carespace?</Navbar.Text>,
        <Nav key="nav-cta">
          <NavItem onClick={this.goToSignIn} className="btn-trial">
            Sign In
          </NavItem>
        </Nav>
      ];
    }

    if (this.props.type === "create") {
      return [
        <Navbar.Text key="nav-text">
          Looking to set up a new carespace?
        </Navbar.Text>,
        <Nav key="nav-cta">
          <NavItem onClick={this.goToCreate} className="btn-trial">
            Create a new carespace
          </NavItem>
        </Nav>
      ];
    }

    return [
      <Navbar.Text key="nav-text">
        Looking to join an existing carespace?
      </Navbar.Text>,
      <Nav key="nav-cta">
        <NavItem onClick={this.goToFindTeam} className="btn-trial">
          Find Your Carespace
        </NavItem>
      </Nav>
    ];
  }

  render() {
    return (
      <div className="authentication-header">
        <Navbar id="header" inverse fixedTop>
          <Navbar.Header>
            <Navbar.Brand>{this.renderBrand()}</Navbar.Brand>
          </Navbar.Header>

          <div className="cta-wrapper pull-right hidden-xs">
            {this.renderCTA()}
          </div>
        </Navbar>
      </div>
    );
  }
}

AuthenticationHeader.propTypes = {
  type: PropTypes.string.isRequired
};

export default AuthenticationHeader;
