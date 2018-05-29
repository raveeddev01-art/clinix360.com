import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import Alert from "react-bootstrap/lib/Alert";
import MinimalHeader from "../../../authentication/components/header/minimal_header";

// TODO: rename Card
class Card extends Component {
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
    const { children, title, className, headerType, footer } = this.props;
    const cardStyles = cx("authentication-card", className);

    return (
      <div className={cardStyles}>
        <MinimalHeader type={headerType} />
        <div className="authentication-body">
          {this.props.errorText && this._renderError()}
          <h1>{title}</h1>
          {this._renderDescription()}
          {children}
        </div>
        <div className="authentication-footer">{footer}</div>
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
  headerType: PropTypes.string,
  errorText: PropTypes.node
};

Card.defaultProps = {
  children: null,
  description: "",
  title: "",
  className: "",
  footer: "",
  headerType: "find-team",
  errorText: ""
};

export default Card;
