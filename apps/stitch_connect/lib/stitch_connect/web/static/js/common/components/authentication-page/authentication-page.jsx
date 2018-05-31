import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import Alert from "react-bootstrap/lib/Alert";
import { AuthenticationHeader } from "common/components";

class AuthenticationPage extends Component {
  _renderDescription = () => {
    const { description } = this.props;
    return (
      description && (
        <h5>
          <div className="card-description">{description}</div>
        </h5>
      )
    );
  };

  _renderError = () => {
    return <Alert bsStyle="danger">{this.props.errorText}</Alert>;
  };

  render() {
    const { children, title, className, headerCTA, footer } = this.props;
    const cardStyles = cx("authentication-card", className);

    return (
      <div className={cardStyles}>
        <AuthenticationHeader type={headerCTA} />
        <div className="authentication-body">
          {this.props.errorText && this._renderError()}
          <h1>{title}</h1>
          {this._renderDescription()}
          {children}
          {footer}
        </div>
      </div>
    );
  }
}

AuthenticationPage.propTypes = {
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
  headerCTA: PropTypes.string,
  errorText: PropTypes.node
};

AuthenticationPage.defaultProps = {
  children: null,
  description: "",
  title: "",
  className: "",
  footer: "",
  headerCTA: "find-team",
  errorText: ""
};

export default AuthenticationPage;
