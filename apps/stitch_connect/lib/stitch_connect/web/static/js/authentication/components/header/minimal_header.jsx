import React, { Component } from "react";
import PropTypes from "prop-types";

import Nav from "react-bootstrap/lib/Nav";
import Navbar from "react-bootstrap/lib/Navbar";
import NavItem from "react-bootstrap/lib/NavItem";
import { Link } from "react-router-dom";

class MinimalHeader extends Component {
  goToFindTeam() {
    window.location.href = `https://${applicationHost}/find-your-team`;
  }

  goToSignIn() {
    window.location.href = `https://${applicationHost}/signin`;
  }

  goToCreate() {
    window.location.href = `https://${applicationHost}/signup/email`;
  }

  renderCTA() {
    if (this.props.type === "no-cta") {
      return null;
    }

    if (this.props.type === "signin") {
      return (
        <Nav pullRight className="hidden-xs">
          <NavItem onClick={this.goToSignIn}> Already on a team? </NavItem>
          <NavItem onClick={this.goToSignIn} className="btn-trial">
            Sign In
          </NavItem>
        </Nav>
      );
    }

    if (this.props.type === "create") {
      return (
        <Nav pullRight className="hidden-xs">
          <NavItem onClick={this.goToCreate}>
            {" "}
            Looking to set up a new workspace?{" "}
          </NavItem>
          <NavItem onClick={this.goToCreate} className="btn-trial">
            Create a new team
          </NavItem>
        </Nav>
      );
    }

    return (
      <Nav pullRight className="hidden-xs">
        <NavItem onClick={this.goToFindTeam}>
          {" "}
          Looking to join an existing team?{" "}
        </NavItem>
        <NavItem onClick={this.goToFindTeam} className="btn-trial">
          Find Your Team
        </NavItem>
      </Nav>
    );
  }

  render() {
    return (
      <div className="authentication-header">
        <Navbar id="header" inverse fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/" className="brand">
                <img src="/images/stitch-brand.png" alt="Stitch" />
              </Link>
            </Navbar.Brand>
          </Navbar.Header>

          {this.renderCTA()}
        </Navbar>
      </div>
    );
  }
}

MinimalHeader.propTypes = {
  type: PropTypes.string.isRequired
};

export default MinimalHeader;
