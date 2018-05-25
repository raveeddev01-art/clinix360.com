import React, { Component } from "react";
import PropTypes from "prop-types";
import Nav from "react-bootstrap/lib/Nav";
import Navbar from "react-bootstrap/lib/Navbar";
import NavItem from "react-bootstrap/lib/NavItem";
import cx from "classnames";
import { Link } from "react-router-dom";
import Alert from "react-bootstrap/lib/Alert";

class Card extends Component {
  _renderDescription = () => {
    const { description } = this.props;
    return description && <h4>{description}</h4>;
  };

  _renderError = () => {
    return <Alert bsStyle="danger">{this.props.errorText}</Alert>;
  };

  goToFindTeam() {
    window.location.href = `https://${applicationHost}/find-your-team`;
  }

  render() {
    const { children, title, className, footer } = this.props;
    const cardStyles = cx("authentication-card", className);

    return (
      <div className={cardStyles}>
        <div className="authentication-header">
          <Navbar id="header" inverse fixedTop>
            <Navbar.Header>
              <Navbar.Brand>
                <Link to="/" className="brand">
                  <img src="/images/stitch-brand.png" alt="Stitch" />
                </Link>
              </Navbar.Brand>
            </Navbar.Header>

            <Nav pullRight className="hidden-xs">
              <NavItem onClick={this.goToFindTeam}>
                {" "}
                Looking to join an existing team?{" "}
              </NavItem>
              <NavItem onClick={this.goToFindTeam} className="btn-trial">
                Find Your Team
              </NavItem>
            </Nav>
          </Navbar>
        </div>
        <div className="authentication-body">
          {this.props.errorText && this._renderError()}
          <h1>{title}</h1>
          {this._renderDescription()}
          {children}
        </div>
        {footer}
      </div>
    );
  }
}

Card.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  footer: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  className: PropTypes.string,
  errorText: PropTypes.node
};

Card.defaultProps = {
  children: null,
  description: "",
  title: "",
  className: "",
  footer: "",
  errorText: ""
};

export default Card;
