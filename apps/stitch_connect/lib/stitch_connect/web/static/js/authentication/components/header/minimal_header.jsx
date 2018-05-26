import React, { Component } from "react";
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

  renderCTA() {
    if (this.props.cta === "signin") {
      return (
        <Nav pullRight className="hidden-xs">
          <NavItem onClick={this.goToSignIn}> Know your team's url? </NavItem>
          <NavItem onClick={this.goToSignIn} className="btn-trial">
            Sign In
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

export default MinimalHeader;
